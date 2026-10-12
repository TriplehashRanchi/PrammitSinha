// Script for Section 1 — Hero

document.addEventListener('DOMContentLoaded', () => {
    const vslWrapper = document.querySelector('.vsl-iframe-wrapper');
    const vslVideo = document.querySelector('.vsl-iframe');
    const vslPlayButton = document.querySelector('.vsl-overlay-play');

    if (vslWrapper && vslVideo && vslPlayButton) {
        vslPlayButton.addEventListener('click', () => {
            vslVideo.play();
        });

        vslVideo.addEventListener('play', () => {
            vslWrapper.classList.add('is-playing');
        });

        vslVideo.addEventListener('ended', () => {
            vslWrapper.classList.remove('is-playing');
        });
    }

    document.querySelectorAll('.testimonial-video-wrapper').forEach((wrapper) => {
        const video = wrapper.querySelector('.testimonial-video');
        const playButton = wrapper.querySelector('.testimonial-overlay-play');

        if (!video || !playButton) {
            return;
        }

        playButton.addEventListener('click', () => {
            video.play();
        });

        video.addEventListener('play', () => {
            wrapper.classList.add('is-playing');
        });

        video.addEventListener('pause', () => {
            if (!video.ended) {
                wrapper.classList.remove('is-playing');
            }
        });

        video.addEventListener('ended', () => {
            wrapper.classList.remove('is-playing');
        });
    });

    const mediaQuery = window.matchMedia('(max-width: 600px)');
    const marqueeContainer = document.querySelector('.media-image-marquee-container');
    const marqueeTrack = document.querySelector('.media-image-marquee-track');

    if (!marqueeContainer || !marqueeTrack) {
        return;
    }

    let animationFrameId = null;
    let isDragging = false;
    let startX = 0;
    let dragStartOffset = 0;
    let offset = 0;
    let lastTime = 0;
    const speed = 38;

    const getLoopWidth = () => marqueeTrack.scrollWidth / 2;

    const normalizeOffset = () => {
        const loopWidth = getLoopWidth();
        if (!loopWidth) {
            return;
        }

        while (offset <= -loopWidth) {
            offset += loopWidth;
        }

        while (offset > 0) {
            offset -= loopWidth;
        }
    };

    const renderMarquee = () => {
        normalizeOffset();
        marqueeTrack.style.transform = `translate3d(${offset}px, 0, 0)`;
    };

    const tick = (time) => {
        if (!lastTime) {
            lastTime = time;
        }

        const delta = (time - lastTime) / 1000;
        lastTime = time;

        if (!isDragging) {
            offset -= speed * delta;
            renderMarquee();
        }

        animationFrameId = window.requestAnimationFrame(tick);
    };

    const startMarquee = () => {
        if (animationFrameId || !mediaQuery.matches) {
            return;
        }

        lastTime = 0;
        marqueeTrack.style.animation = 'none';
        animationFrameId = window.requestAnimationFrame(tick);
    };

    const stopMarquee = () => {
        if (animationFrameId) {
            window.cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        marqueeTrack.style.transform = '';
        marqueeTrack.style.animation = '';
        lastTime = 0;
        isDragging = false;
    };

    const handlePointerDown = (event) => {
        if (!mediaQuery.matches) {
            return;
        }

        isDragging = true;
        startX = event.clientX;
        dragStartOffset = offset;
        marqueeContainer.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event) => {
        if (!isDragging || !mediaQuery.matches) {
            return;
        }

        offset = dragStartOffset + event.clientX - startX;
        renderMarquee();
    };

    const handlePointerUp = (event) => {
        if (!isDragging) {
            return;
        }

        isDragging = false;
        lastTime = 0;

        if (marqueeContainer.hasPointerCapture(event.pointerId)) {
            marqueeContainer.releasePointerCapture(event.pointerId);
        }
    };

    marqueeContainer.addEventListener('pointerdown', handlePointerDown);
    marqueeContainer.addEventListener('pointermove', handlePointerMove);
    marqueeContainer.addEventListener('pointerup', handlePointerUp);
    marqueeContainer.addEventListener('pointercancel', handlePointerUp);

    const syncMarqueeMode = () => {
        if (mediaQuery.matches) {
            startMarquee();
        } else {
            stopMarquee();
        }
    };

    syncMarqueeMode();
    mediaQuery.addEventListener('change', syncMarqueeMode);
});
