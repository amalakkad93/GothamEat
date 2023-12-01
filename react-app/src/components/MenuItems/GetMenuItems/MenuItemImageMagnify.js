import React, { useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import ReactImageMagnify from "react-image-magnify";
import 'react-lazy-load-image-component/src/effects/blur.css';

/**
 * Component to display and magnify a menu item image.
 * It uses lazy loading for initial image display, and once the image is fully loaded,
 * it switches to a magnified view using ReactImageMagnify.
 *
 * Props:
 * - imagePath: The URL of the image to display and magnify.
 */
const MenuItemImageMagnify = ({ imagePath }) => {
    // State to track if the image has loaded
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    // Effect to load the image and update state when loaded
    useEffect(() => {
        // Create a new Image object
        const image = new Image();
        image.src = imagePath;

        // Set state to true when image is loaded
        image.onload = () => setIsImageLoaded(true);
    }, [imagePath]); // Dependency array ensures this runs only when imagePath changes

    return (
        <div className="magnify-container">
            {isImageLoaded ? (
                // Once image is loaded, display with magnification functionality
                <ReactImageMagnify
                    smallImage={{
                        alt: 'Menu Item',
                        isFluidWidth: true,
                        src: imagePath
                    }}
                    largeImage={{
                        src: imagePath,
                        width: 1200,
                        height: 1800
                    }}
                    enlargedImagePosition="over" // Position of the enlarged image
                />
            ) : (
                // Initially display a lazy-loaded image with blur effect while loading
                <LazyLoadImage
                    alt="Menu Item"
                    src={imagePath}
                    effect="blur"
                    width="100%"
                    height="auto"
                />
            )}
        </div>
    );
};

export default MenuItemImageMagnify;
