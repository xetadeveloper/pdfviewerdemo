import React, { useState, useEffect, useRef } from 'react';
import interact from 'interactjs';
import './App.css';

export default function AppDraggable() {
    const [blockInteract, setBlockInteract] = useState(null);
    const [{ top, left }, setBlockCoordinates] = useState({ top: 0, left: 0 });

    const transformPos = useRef({ x: 0, y: 0 });
    const elemPos = useRef({ left: '40%', top: '20%' });
    const dragRef = useRef();
    const dragContainerRef = useRef();
    const dropTargetRef = useRef();

    /*
    For dargging from sidebar into drop area
    ===========================================
    1. We translate the movement till it gets to its end and do one of these: 
        a) If the drop location is greater than the pdf viewer width + its offset from the viewport,
        then we cancel the drop i.e. if it is dropped out of bounds
        
        b) If in bounds, we calculate the drop location within the pdf viewer and add a new block
        
    2. For dragging inside the block, we use the translation also and calculate the position top and left
        to drop the box, in percentage, using the blocks offset from its parent (pdf viewer)

    3. For translating edit points to pdf-lib, we can check if pdf-lib has a pdf dimensions function to get
        the dimensions of the PDF
    */

    useEffect(() => {
        //  Set up the component for interaction
        const block = interact(dragRef.current); // Use the ref of the component

        block.draggable({
            inertia: true,
            // This modifier config can be used to restrict the elem to parent boundaries
            // modifiers: [
            //     interact.modifiers.restrictRect({
            //         restriction: 'parent',
            //         // endOnly: true,
            //     }),
            // ],
            // Set up listeners
            listeners: {
                start(event) {
                    elemPos.current.left = event.target.offsetLeft;
                    elemPos.current.top = event.target.offsetTop;

                    // console.log('Starting event left: ', elemPos.current.left);
                    // console.log('Starting event top: ', elemPos.current.right);
                },
                move(event) {
                    // console.log('Transform delta: ', event.dx, event.dy);
                    // Increase the position movement by delta
                    elemPos.current.left += event.dx;
                    elemPos.current.top += event.dy;

                    // Increase the transform to simulate movement
                    transformPos.current.x += event.dx;
                    transformPos.current.y += event.dy;
                    event.target.style.transform = `translate(${transformPos.current.x}px, ${transformPos.current.y}px)`;

                    event.target.style.left = elemPos.current.left;
                    event.target.style.top = elemPos.current.top;

                    // console.log(
                    //     'Element position on current drag: ',
                    //     elemPos.current.left,
                    //     elemPos.current.top
                    // );
                },
                end(event) {
                    // console.log('Drag has ended');
                    const localPosLeft = elemPos.current.left;
                    const localPosTop = elemPos.current.top;

                    // console.log(
                    //     'Container width: ',
                    //     dragContainerRef.current.getBoundingClientRect().width
                    // );

                    // This converts it to percentage on drag end
                    event.target.style.left =
                        (localPosLeft /
                            dragContainerRef.current.getBoundingClientRect().width) *
                            100 +
                        '%';
                    event.target.style.top =
                        (localPosTop /
                            dragContainerRef.current.getBoundingClientRect().height) *
                            100 +
                        '%';

                    // Reset position
                    event.target.style.transform = `none`;
                    transformPos.current.x = 0;
                    transformPos.current.y = 0;
                },
            },
        });

        block.on('tap', () => {
            console.log('I was tapped!!');
        });

        setBlockInteract(block);
    }, []);

    return (
        <div className={`container`}>
            <div ref={dragContainerRef} className={`dropTarget dropTargetA`}>
                <h2 ref={dragRef} className='appDragBlock'>
                    Drag
                </h2>
            </div>

            <div className={`dropTarget dropTargetB`} ref={dropTargetRef}>
                <h4>Drop me here</h4>
            </div>
        </div>
    );
}
