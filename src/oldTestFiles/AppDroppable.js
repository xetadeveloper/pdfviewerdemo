import React, { useState, useEffect, useRef } from 'react';
import interact from 'interactjs';
import './App.css';

export default function App() {
    const transformPos = useRef({ x: 0, y: 0 });
    const dragRef = useRef();
    const pageRef = useRef();
    const dropTargetRef = useRef();

    /* 
    1. Make ActionButton draggable and figure out where it stopped on the droppable by calculations again
    2. The dropppable element will create the new field block
    3. Maybe wrap a context around the operation to enable the draggable pass info to the droppable
    */

    useEffect(() => {
        //  Set up the component for interaction
        const block = interact(dragRef.current); // Use the ref of the component

        block.draggable({
            listeners: {
                start(event) {
                    console.log('Drag start event: ', event);
                },
                move(event) {
                    // Increase the transform to simulate movement
                    transformPos.current.x += event.dx;
                    transformPos.current.y += event.dy;
                    event.target.style.transform = `translate(${transformPos.current.x}px, ${transformPos.current.y}px)`;
                },
                end(event) {
                    transformPos.current.x = 0;
                    transformPos.current.y = 0;
                    event.target.style.transform = 'none';
                },
            },
        });
    }, []);

    useEffect(() => {
        const dropTarget = interact(dropTargetRef.current);

        dropTarget.dropzone({
            accept: null,
            ondrop: event => {
                const dropRect = event.dragEvent.rect;

                const dropLeft =
                    dropRect.left - dropTargetRef.current.getBoundingClientRect().left;

                const dropTop =
                    dropRect.top - dropTargetRef.current.getBoundingClientRect().top;

                console.log('dropRect: ', dropRect);
                console.log(
                    'dropTarget rect: ',
                    dropTargetRef.current.getBoundingClientRect().left,
                    dropTargetRef.current.getBoundingClientRect().top
                );

                // Relative to drop target
                const divRelativeToDrop = document.createElement('div');
                divRelativeToDrop.innerHTML = 'T';
                divRelativeToDrop.style.cssText = `
                height:20px; 
                width: 20px;
                position: absolute;
                line-height: 20px;
                text-align: center;
                color: #fff;
                font-size: 12px;
                font-weight: 800;
                background-color: green;
                top:${dropTop}px;
                left:${dropLeft}px;
                `;
                dropTargetRef.current?.appendChild(divRelativeToDrop);

                // Relative to the page
                const divRelativeToPage = document.createElement('div');
                divRelativeToPage.innerHTML = 'P';
                divRelativeToPage.style.cssText = `
                height:20px; 
                line-height: 20px;
                text-align: center;
                color: #fff;
                font-size: 12px;
                font-weight: 800;
                width: 20px;
                position: absolute;
                background-color: red;
                top:${dropRect.top}px;
                left:${dropRect.left}px;
                `;
                // pageRef.current?.appendChild(divRelativeToPage);

                // Relative to the viewport
                const divRelativeToViewport = document.createElement('div');
                divRelativeToViewport.style.cssText = `
                height:20px; 
                width: 20px;
                position: absolute;
                background-color: blue;
                top:${event.dragEvent.y0}px;
                left:${event.dragEvent.x0}px;
                `;

                console.log('Event on drop: ', event);
                console.log('PageXY: ', event.dragEvent.clientX, event.dragEvent.clientY);
            },
        });
    }, []);

    return (
        <div className={`container`} ref={pageRef}>
            <div className={`dragContainer`}>
                <h2 ref={dragRef} className='appDragBlock all-draggable'>
                    D
                </h2>
            </div>

            <div className={`dropTarget dropTargetB`} ref={dropTargetRef}>
                <h4>Drop me here</h4>
            </div>
        </div>
    );
}
