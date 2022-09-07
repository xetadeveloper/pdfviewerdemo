// Modules
import React, { useEffect, useRef, useState } from 'react';
import localPDF from './Free General Agreement Form.pdf';

// Styles
import style from './App.module.css';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import logoImg from './images/logo192.png';

// Components

export default function App(props) {
    const [canvasHeight, setCanvasHeight] = useState(150);
    const [canvasWidth, setCanvasWidth] = useState(300);
    const [pdfDocument, setPDFDocument] = useState();
    const [isPDFChanged, setIsPDFChanged] = useState(false);
    const [showHTMLBlock, setShowHTMLBlock] = useState(true);
    const [font, setFont] = useState();

    const blockText = 'John Carmichael';
    const textTop = 20;
    const textLeft = 40;
    const textFontSize = 20;
    const offsetY = 16;

    const imgTop = 200;
    const imgLeft = 400;

    GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'; //Add the src path of the worker

    const containerRef = useRef();
    const canvasRef = useRef();
    const anchorRef = useRef();

    useEffect(() => {
        createPDFBlob();
    }, []);

    useEffect(() => {
        if (isPDFChanged) {
            renderPDF();
            setIsPDFChanged(false);
        }
    }, [isPDFChanged]);

    async function createPDFBlob() {
        const url = 'https://pdf-lib.js.org/assets/with_update_sections.pdf';
        const res = await fetch(url);
        const pdfBuffer = await res.arrayBuffer();

        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

        // console.log('pdf page 1 height: ', pdfDoc.getPage(0).getHeight());
        // console.log('pdf page 1 width: ', pdfDoc.getPage(0).getWidth());
        setIsPDFChanged(true);
        setPDFDocument(pdfDoc);
        setFont(font);
    }

    // Figure out why render pdf is being called twice
    async function renderPDF() {
        console.log('Rendering PDF....');

        // Save the pdf first
        const changedPDF = await pdfDocument.save();

        const pdf = await getDocument(changedPDF).promise; // Fetch the pdf document
        const page = await pdf.getPage(1);

        // console.log('With scale of 1', page.getViewport({ scale: 1 }));
        const scaledViewport = page.getViewport({ scale: 1 });

        // render the page
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const canvasContext = canvas.getContext('2d');

            setCanvasHeight(scaledViewport.height);
            setCanvasWidth(scaledViewport.width);

            // canvas.height = scaledViewport.height;
            // canvas.width = scaledViewport.width;

            if (canvasContext) {
                const renderContext = { canvasContext, viewport: scaledViewport };

                await page.render(renderContext).promise;
            }
        } else {
            console.error('Canvas ref does not have value');
        }
    }

    async function savePDF() {
        const pdfBytes = await pdfDocument.save();
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        const pdfFile = URL.createObjectURL(pdfBlob);

        anchorRef.current.href = pdfFile;
        anchorRef.current.click();
    }

    function modifyPDF() {
        const page = pdfDocument.getPage(0);
        const pageSize = page.getSize();
        const { height: pdfHeight, width: pdfWidth } = pageSize;

        console.log('Page size: ', pageSize);
        const percentageTop = (textTop / canvasHeight) * 100;
        const percentageLeft = (textLeft / canvasWidth) * 100;

        // const pdfX = (percentageLeft / 100) * pageSize.width;
        // const pdfY = (percentageTop / 100) * pageSize.height;
        // const pdfX = blockLeft;
        // const pdfY = pdfHeight - blockTop;

        // This will be useful for conversion when the height and width changes due to responsiveness
        // x_image = (x_pdf * width_image) / width_page;
        // y_image = ((height_pdf - y_pdf) * height_image) / height_pdf;

        // Where is this offsetY coming from (HTML/PDF)???????
        const pdfY = pdfHeight - textTop - offsetY;
        const pdfX = textLeft;

        console.log('HTML X: ', textLeft);
        console.log('HTML Y: ', textTop, textTop + offsetY);
        console.log('PDF XY: ', pdfX, pdfY);

        page.drawText(blockText, {
            x: pdfX,
            y: pdfY,
            size: textFontSize,
            font,
            color: rgb(0, 0, 1),
        });

        // page.drawImage()

        setIsPDFChanged(true);
        setShowHTMLBlock(false);
    }

    return (
        <div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <button onClick={savePDF}>Save and export PDF</button>
                <button hidden={!pdfDocument} onClick={modifyPDF}>
                    Modify PDF
                </button>
            </div>
            <div
                ref={containerRef}
                className={`${style.canvasContainer}`}
                style={{
                    height: canvasHeight,
                    width: canvasWidth,
                }}>
                {!pdfDocument && <h3>Loading PDF...</h3>}

                <canvas
                    ref={canvasRef}
                    className={`${style.canvasElem}`}
                    width={canvasWidth}
                    height={canvasHeight}></canvas>

                {pdfDocument && showHTMLBlock && (
                    <>
                        <div
                            className={`${style.text}`}
                            style={{
                                top: textTop + 'px',
                                left: textLeft + 'px',
                                fontSize: textFontSize + 'px',
                            }}>
                            {blockText}
                        </div>

                        <img
                            hidden
                            src={logoImg}
                            className={`${style.logoImg}`}
                            style={{ top: imgTop + 'px', left: imgLeft + 'px' }}
                        />
                    </>
                )}
            </div>
            <a ref={anchorRef} href='' target='_blank'></a>
        </div>
    );
}
