export namespace app {
	
	export class MeshInfo {
	    name: string;
	    numTriangles: number;
	    numVertices: number;
	    isWatertight: boolean;
	    boundaryEdges: number;
	    boundsMinX: number;
	    boundsMinY: number;
	    boundsMinZ: number;
	    boundsMaxX: number;
	    boundsMaxY: number;
	    boundsMaxZ: number;
	    centerX: number;
	    centerY: number;
	    centerZ: number;
	    extentX: number;
	    extentY: number;
	    extentZ: number;
	
	    static createFrom(source: any = {}) {
	        return new MeshInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.numTriangles = source["numTriangles"];
	        this.numVertices = source["numVertices"];
	        this.isWatertight = source["isWatertight"];
	        this.boundaryEdges = source["boundaryEdges"];
	        this.boundsMinX = source["boundsMinX"];
	        this.boundsMinY = source["boundsMinY"];
	        this.boundsMinZ = source["boundsMinZ"];
	        this.boundsMaxX = source["boundsMaxX"];
	        this.boundsMaxY = source["boundsMaxY"];
	        this.boundsMaxZ = source["boundsMaxZ"];
	        this.centerX = source["centerX"];
	        this.centerY = source["centerY"];
	        this.centerZ = source["centerZ"];
	        this.extentX = source["extentX"];
	        this.extentY = source["extentY"];
	        this.extentZ = source["extentZ"];
	    }
	}

}

export namespace main {
	
	export class runRequest {
	    weights: number[];
	    method: string;
	
	    static createFrom(source: any = {}) {
	        return new runRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.weights = source["weights"];
	        this.method = source["method"];
	    }
	}

}

export namespace raycaster {
	
	export class ScannerConfig {
	    SDD: number;
	    SOD: number;
	    DetWidth: number;
	    DetHeight: number;
	    DetPixelsX: number;
	    DetPixelsY: number;
	    RayGridX: number;
	    RayGridY: number;
	    NumProjections: number;
	
	    static createFrom(source: any = {}) {
	        return new ScannerConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.SDD = source["SDD"];
	        this.SOD = source["SOD"];
	        this.DetWidth = source["DetWidth"];
	        this.DetHeight = source["DetHeight"];
	        this.DetPixelsX = source["DetPixelsX"];
	        this.DetPixelsY = source["DetPixelsY"];
	        this.RayGridX = source["RayGridX"];
	        this.RayGridY = source["RayGridY"];
	        this.NumProjections = source["NumProjections"];
	    }
	}

}

