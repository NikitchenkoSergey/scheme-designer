namespace SchemeDesigner {
    /**
     * Layer class
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    export class Layer
    {
        /**
         * Layer id
         */
        protected id: string;

        /**
         * Z index
         */
        protected zIndex: number = 0;

        /**
         * Is active
         */
        protected active: boolean = true;

        /**
         * Is visible
         */
        protected visible: boolean = true;

        /**
         * Constructor
         * @param id
         * @param {Object} params
         */
        constructor(id: string, params?: any)
        {
            if (id.length == 0) {
                throw new Error('Empty layer id');
            }

            this.id = id;

            Tools.configure(this, params);
        }

        /**
         * Set zIndex
         * @param {number} value
         */
        public setZIndex(value: number): void
        {
            this.zIndex = value;
        }

        /**
         * Set active
         * @param {boolean} value
         */
        public setActive(value: boolean): void
        {
            this.active = value;
        }

        /**
         * Set visible
         * @param {boolean} value
         */
        public setVisible(value: boolean): void
        {
            this.visible = value;
        }

        /**
         * Get visible
         * @return {boolean}
         */
        public getVisible(): boolean
        {
            return this.visible;
        }

        /**
         * Get active
         * @return {boolean}
         */
        public getActive(): boolean
        {
            return this.active;
        }

        /**
         * Get z index
         * @return {boolean}
         */
        public getZIndex(): number
        {
            return this.zIndex;
        }

        /**
         * Get id
         * @return {string}
         */
        public getId(): string
        {
            return this.id;
        }
    }
}
