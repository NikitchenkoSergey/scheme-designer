namespace SchemeDesigner {
    /**
     * Polyfill
     */
    export class Polyfill {

        /**
         * Get request animation frame function
         * @returns {Function}
         */
        public static getRequestAnimationFrameFunction(): Function
        {
            let variables: string[] = [
                'requestAnimationFrame',
                'webkitRequestAnimationFrame',
                'mozRequestAnimationFrame',
                'oRequestAnimationFrame',
                'msRequestAnimationFrame'
            ];

            for (let variableName of variables) {
                if (window.hasOwnProperty(variableName)) {
                    return (window as any)[variableName];
                }
            }

            return function (callback: any) {
                return window.setTimeout(callback, 1000 / 60);
            };
        }

        /**
         * Get cancel animation function
         * @returns {Function}
         */
        public static getCancelAnimationFunction(): Function
        {
            return window.cancelAnimationFrame || window.clearTimeout;
        }

        /**
         * Get device pixel radio
         * @returns {number}
         */
        public static getDevicePixelRatio(): number
        {
            let variables: string[] = [
                'devicePixelRatio',
                'webkitDevicePixelRatio',
                'mozDevicePixelRatio'
            ];

            for (let variableName of variables) {
                if (window.hasOwnProperty(variableName)) {
                    return (window as any)[variableName];
                }
            }

            return 1;
        }
    }
}