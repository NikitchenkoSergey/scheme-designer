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
         * Objects
         */
        protected objects: SchemeObject[] = [];

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
         * Need to rebuild manually tree by calling requestBuildTree()
         * Remove object
         * @param {SchemeObject} object
         */
        public removeObject(object: SchemeObject): void
        {
            this.objects = this.objects.filter(existObject => existObject !== object);
        }

        /**
         * Remove all objects
         */
        public removeObjects(): void
        {
            this.objects = [];
        }

        /**
         * Get objects
         * @returns {SchemeObject[]}
         */
        public getObjects(): SchemeObject[]
        {
            return this.objects;
        }

        /**
         * Add object
         * @param {SchemeObject} object
         */
        public addObject(object: SchemeObject): void
        {
            object.setLayerId(this.id);
            this.objects.push(object);
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
         * Get is visible
         * @return {boolean}
         */
        public isVisible(): boolean
        {
            return this.visible;
        }

        /**
         * Get is active
         * @return {boolean}
         */
        public isActive(): boolean
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
