﻿// Project Script Bundle
window['unity.playground.js']=true;


// unity.playground.js
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var PROJECT;
(function (PROJECT) {
    /**
     * Babylon network entity (Colyseus Universal Game Room)
     * @class ColyseusGameServer - All rights reserved (c) 2020 Mackey Kinard
    */
    class ColyseusGameServer extends UNITY.ScriptComponent {
        static get Instance() { return PROJECT.ColyseusGameServer.StaticInstance; }
        isSoloSession() { return this.soloSession; }
        isHostSession() { return (this.hostSessionName != null && this.hostSessionName !== ""); }
        getColyseusClient() { return this.client; }
        constructor(transform, scene, properties) {
            super(transform, scene, properties);
            this.projectName = "Game Project";
            this.autoJoinRoom = true;
            this.playerUserName = "Player";
            this.defaultRoomName = "default";
            this.roomLogicModule = "DefaultLogic";
            this.maxClientsAllowed = 8;
            this.patchUpdateRateFps = 20;
            this.roomSimulateRateFps = 60;
            this.networkBufferingTime = 0.15;
            this.soloSession = false;
            this.colyseusAvailable = false;
            this.networkRoomConnected = false;
            this.hostSessionName = null;
            this.joinRoomId = null;
            this.client = null;
            PROJECT.ColyseusGameServer.StaticInstance = this;
        }
        awake() {
            if (BABYLON.NetworkManager.IsAvailable()) {
                this.colyseusAvailable = true;
                BABYLON.Tools.Log("Colyseus network library loaded");
            }
            else {
                this.colyseusAvailable = false;
                BABYLON.Tools.Warn("Colyseus network library not available");
            }
            try {
                const playerSoloParam = UNITY.WindowManager.GetUrlParameter("solo");
                if (playerSoloParam != null && playerSoloParam !== "" && playerSoloParam !== "*") {
                    if (playerSoloParam.toLowerCase() === "true") {
                        this.soloSession = true;
                        this.colyseusAvailable = false;
                        BABYLON.Tools.Warn("Colyseus solo network game play requested");
                    }
                }
            }
            catch (e) {
                console.error(e);
            }
            if (this.colyseusAvailable === true) {
                try {
                    const serverEndpointParam = UNITY.WindowManager.GetUrlParameter("endpoint");
                    if (serverEndpointParam != null && serverEndpointParam !== "") {
                        const serverEndpoint = decodeURIComponent(serverEndpointParam);
                        if (serverEndpoint != null && serverEndpoint !== "" && serverEndpoint !== "*") {
                            UNITY.SceneManager.ServerEndPoint = serverEndpoint;
                        }
                    }
                }
                catch (e0) {
                    console.error(e0);
                }
                try {
                    const playerNameParam = UNITY.WindowManager.GetUrlParameter("player");
                    if (playerNameParam != null && playerNameParam !== "" && playerNameParam !== "*") {
                        this.playerUserName = decodeURIComponent(playerNameParam);
                    }
                }
                catch (e1) {
                    console.error(e1);
                }
                try {
                    const roomNameParam = UNITY.WindowManager.GetUrlParameter("room");
                    if (roomNameParam != null && roomNameParam !== "" && roomNameParam !== "*") {
                        this.defaultRoomName = decodeURIComponent(roomNameParam);
                    }
                }
                catch (e2) {
                    console.error(e2);
                }
                try {
                    const hostSessionParam = UNITY.WindowManager.GetUrlParameter("host");
                    if (hostSessionParam != null && hostSessionParam !== "" && hostSessionParam !== "*") {
                        this.hostSessionName = decodeURIComponent(hostSessionParam);
                    }
                }
                catch (e3) {
                    console.error(e3);
                }
                try {
                    const joinSessionParam = UNITY.WindowManager.GetUrlParameter("join");
                    if (joinSessionParam != null && joinSessionParam !== "" && joinSessionParam !== "*") {
                        this.joinRoomId = decodeURIComponent(joinSessionParam);
                    }
                }
                catch (e4) {
                    console.error(e4);
                }
                BABYLON.NetworkManager.OnJoinRoomObservable.add((user) => { console.warn(user.name + " joined the " + this.defaultRoomName.toLowerCase() + " room."); });
            }
        }
        update() {
            if (this.colyseusAvailable === true && this.networkRoomConnected === false && this.autoJoinRoom === true && this.isReady()) {
                this.autoJoinRoom = false;
                this.joinRoom();
            }
        }
        destroy() {
            this.autoJoinRoom = false;
            this.colyseusAvailable = false;
            this.networkRoomConnected = true;
            this.defaultRoomName = null;
            this.playerUserName = null;
            this.client = null;
        }
        joinRoom() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.patchUpdateRateFps > PROJECT.ColyseusGameServer.MAX_FRAME_RATE)
                    this.patchUpdateRateFps = PROJECT.ColyseusGameServer.MAX_FRAME_RATE;
                if (this.roomSimulateRateFps > PROJECT.ColyseusGameServer.MAX_FRAME_RATE)
                    this.roomSimulateRateFps = PROJECT.ColyseusGameServer.MAX_FRAME_RATE;
                if (this.colyseusAvailable === true) {
                    try {
                        const websocketUrl = (UNITY.SceneManager.ServerEndPoint.toLowerCase().startsWith("http")) ? ("ws" + UNITY.SceneManager.ServerEndPoint.substring(4)) : UNITY.SceneManager.ServerEndPoint;
                        if (UNITY.SceneManager.ServerEndPoint.endsWith("/"))
                            UNITY.SceneManager.ServerEndPoint = UNITY.SceneManager.ServerEndPoint.substring(0, (UNITY.SceneManager.ServerEndPoint.length - 1));
                        if (this.projectName == null || this.projectName === "")
                            this.projectName = "Game Project";
                        console.log(">>> Server Endpoint: " + UNITY.SceneManager.ServerEndPoint);
                        console.log(">>> Web Socket Url: " + websocketUrl);
                        console.log(">>> Max Clients: " + this.maxClientsAllowed);
                        console.log(">>> Room Name: " + this.defaultRoomName);
                        console.log(">>> User Name: " + this.playerUserName);
                        console.log(">>> Host Desc: " + this.hostSessionName);
                        console.log(">>> Join Room: " + this.joinRoomId);
                        let room = null;
                        if (this.client == null)
                            this.client = new Colyseus.Client(websocketUrl);
                        if (this.hostSessionName != null && this.hostSessionName !== "") {
                            const sceneFile = UNITY.SceneManager.GetSceneFile(this.scene);
                            room = yield this.client.create(this.defaultRoomName, {
                                userName: this.playerUserName,
                                roomLogic: this.roomLogicModule,
                                maxClients: this.maxClientsAllowed,
                                interpolationBuffer: this.networkBufferingTime,
                                patchUpdateRateMs: (1000 / this.patchUpdateRateFps),
                                roomSimulationIntervalMs: (1000 / this.roomSimulateRateFps),
                                userDatagramProtocol: false,
                                compressDataPackets: false,
                                project: this.projectName,
                                type: "client",
                                desc: this.hostSessionName,
                                map: sceneFile,
                                aux: "*"
                            });
                        }
                        else if (this.joinRoomId != null && this.joinRoomId !== "") {
                            room = yield this.client.joinById(this.joinRoomId, {
                                userName: this.playerUserName
                            });
                        }
                        if (room != null) {
                            BABYLON.NetworkManager.AttachDefaultRoom(this.scene, room);
                        }
                        else {
                            console.error("Failed to join room: " + this.transform.name);
                        }
                    }
                    catch (e) {
                        console.error("Failed to connect: ", e);
                    }
                    finally {
                        this.networkRoomConnected = true;
                    }
                }
            });
        }
    }
    ColyseusGameServer.MAX_FRAME_RATE = 200;
    ColyseusGameServer.StaticInstance = null;
    PROJECT.ColyseusGameServer = ColyseusGameServer;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class ColyseusNetworkAvatar
    */
    class ColyseusNetworkAvatar extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.controlMode = 0;
            this.defaultAvatar = null;
            this.maleAnimationRig = null;
            this.femaleAnimationRig = null;
            this.castRealtimeShadow = true;
            this.disposeOfMannequin = true;
            this.pixelOffsetX = 0;
            this.pixelOffsetY = 0;
            this.playerJoined = false;
            this.preloadLocation = null;
            this.ambientMaterial = new BABYLON.Color3(1.0, 1.0, 1.0);
            this.avatarArmature = null;
            this.avatarSkeleton = null;
            this.avatarHandness = "Left";
            this.avatarGender = "Male";
            this.avatarLabel = "Default Player";
            this.avatarLoaded = false;
            this.animator = null;
            this.avatarReady = false;
            this.manageLabelTexture = true;
            this.textureResolution = 512;
            this.maxLabelWidth = 960;
            this.minLabelWidth = 320;
            this.labelOffsetX = 0;
            this.labelOffsetY = 2.0;
            this.labelHeight = 64;
            this.labelColor = new BABYLON.Color3(0.0, 1.0, 0.0);
            this.labelAlpha = 0.85;
            this.rectColor = new BABYLON.Color3(0.0, 0.0, 0.0);
            this.rectAlpha = 0.65;
            this.fontFamily = "Arial";
            this.fontStyle = "Bold";
            this.fontSize = 36;
            this.fillRect = true;
        }
        awake() {
            this.animator = this.getComponent("UNITY.AnimationState");
            if (this.animator == null)
                BABYLON.Tools.Warn("Failed to locate aniation state component for: " + this.transform.name);
            const defaultAvatarInfo = this.getProperty("defaultAvatar");
            if (defaultAvatarInfo != null)
                this.defaultAvatar = (defaultAvatarInfo.name + ".glb");
            const maleAnimationInfo = this.getProperty("maleAnimationRig");
            if (maleAnimationInfo != null)
                this.maleAnimationRig = (maleAnimationInfo.name + ".glb");
            const femaleAnimationInfo = this.getProperty("femaleAnimationRig");
            if (femaleAnimationInfo != null)
                this.femaleAnimationRig = (femaleAnimationInfo.name + ".glb");
            // ..
            // Setup Browser Platform Options
            // ..
            if (this.isSafariBrowser() === true)
                this.pixelOffsetY = 0;
            else
                this.pixelOffsetY = 2; // Note: Default Two Pixel Offset
        }
        ready() {
            if (this.controlMode === 0) {
                this.setupLocalPlayerAvatar();
            }
            this.avatarReady = true;
        }
        update() {
            if (this.playerJoined === false && this.avatarReady === true) {
                if (BABYLON.NetworkManager.HasJoinedRoom()) {
                    this.playerJoined = true;
                    if (this.controlMode === 0) {
                        if (this.manageLabelTexture === true) {
                            this.avatarLabel = BABYLON.NetworkManager.GetCurrentUser().name;
                            this.createAvatarLabel(this.avatarLabel);
                        }
                    }
                    else if (this.controlMode === 1) {
                        this.setupRemotePlayerAvatar();
                        if (this.manageLabelTexture === true) {
                            this.createAvatarLabel(this.avatarLabel);
                        }
                    }
                }
            }
        }
        destroy() {
            this.animator = null;
            this.avatarLabel = null;
            this.avatarGender = null;
            this.avatarHandness = null;
            this.avatarArmature = null;
            this.avatarSkeleton = null;
            this.defaultAvatar = null;
            this.preloadLocation = null;
            this.maleAnimationRig = null;
            this.femaleAnimationRig = null;
        }
        isSafariBrowser() {
            let result = false;
            if (navigator != null && navigator.userAgent != null) {
                result = navigator.vendor.match(/apple/i) &&
                    !navigator.userAgent.match(/crios/i) &&
                    !navigator.userAgent.match(/fxios/i) &&
                    !navigator.userAgent.match(/Opera|OPT\//);
            }
            return result;
        }
        createAvatarLabel(name) {
            if (name != null && name !== "") {
                const plane = BABYLON.MeshBuilder.CreatePlane("TexturePlane", { width: 1, height: 1 }, this.scene);
                const planeMaterial = new BABYLON.StandardMaterial((this.transform.name + ".PlaneMaterial"), this.scene);
                // ..
                // Background Opacity Texture
                // ..
                const opacityTexture = new BABYLON.DynamicTexture("PlayerTexture", { width: this.textureResolution, height: this.textureResolution }, this.scene);
                const opacityCtx = opacityTexture.getContext();
                const fontString = this.getResizedFontString(name, this.maxLabelWidth, this.fontSize, this.fontFamily, this.fontStyle);
                opacityCtx.font = fontString; // Note: Must Be Set Before Measuring
                const fontWidth = opacityCtx.measureText(name).width;
                const fontPadding = PROJECT.ColyseusNetworkAvatar.FONT_PADDING;
                let rectWidth = (fontWidth + fontPadding);
                let rectHeight = this.labelHeight;
                if (rectWidth < this.minLabelWidth)
                    rectWidth = this.minLabelWidth;
                if (rectWidth > this.maxLabelWidth)
                    rectWidth = this.maxLabelWidth;
                if (this.fillRect === true) {
                    opacityCtx.fillStyle = `rgba(0, 0, 0, ${this.rectAlpha.toString()})`;
                    this.createRoundedRect((this.textureResolution * 0.5) - (rectWidth * 0.5), (this.textureResolution * 0.5) - (rectHeight * 0.5), rectWidth, rectHeight, (rectHeight * 0.5), opacityCtx);
                    opacityCtx.fill();
                }
                opacityCtx.textAlign = "center";
                opacityCtx.textBaseline = "middle";
                opacityCtx.fillStyle = `rgba(0, 0, 0, ${this.labelAlpha.toString()})`;
                opacityCtx.fillText(name, (this.textureResolution * 0.5) + this.pixelOffsetX, (this.textureResolution * 0.5) + this.pixelOffsetY);
                opacityTexture.update(true);
                // ..
                // Background & Foreground Colors
                // ..
                const colorTexture = new BABYLON.DynamicTexture("PlayerTextureColor", { width: this.textureResolution, height: this.textureResolution }, this.scene);
                const colorCtx = colorTexture.getContext();
                colorCtx.fillStyle = this.rectColor.toHexString();
                colorCtx.fillRect(0, 0, this.textureResolution, this.textureResolution);
                colorCtx.font = fontString;
                colorCtx.textAlign = "center";
                colorCtx.textBaseline = "middle";
                colorCtx.fillStyle = this.labelColor.toHexString();
                colorCtx.fillText(name, (this.textureResolution * 0.5) + this.pixelOffsetX, (this.textureResolution * 0.5) + this.pixelOffsetY);
                colorTexture.update(true);
                // ..
                // Plane Name Label Material Setup
                // ..
                planeMaterial.disableLighting = true;
                planeMaterial.opacityTexture = opacityTexture;
                planeMaterial.diffuseTexture = colorTexture;
                planeMaterial.emissiveTexture = colorTexture;
                // ..
                // Plane Position & Offset Parenting
                // ..
                plane.material = planeMaterial;
                plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
                plane.position.x = this.labelOffsetX;
                plane.position.y = (this.labelOffsetY + PROJECT.ColyseusNetworkAvatar.HEIGHT_PADDING);
                plane.parent = this.transform.parent; // FIXME: Maybe Parent To Model Head Bone Or Something - ???
                plane.renderingGroupId = UNITY.Utilities.DefaultRenderGroup();
            }
        }
        createRoundedRect(x, y, w, h, r, ctx) {
            if (w < 2 * r)
                r = w / 2;
            if (h < 2 * r)
                r = h / 2;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
        }
        getResizedFontString(text, maxWidth, startingFontSize, fontFamily = "Arial", fontStyle = "") {
            const tempCanvas = document.createElement('canvas');
            const measureCtx = tempCanvas.getContext('2d');
            const getFontString = (size) => { return `${fontStyle}${(fontStyle === "") ? "" : " "}${size}px ${fontFamily}`; };
            let currentSize = startingFontSize;
            measureCtx.font = getFontString(currentSize); // Note: Must Be Set Before Measuring
            let currentWidth = measureCtx.measureText(text).width;
            if (currentWidth > maxWidth) {
                let step = 1;
                while (currentWidth > maxWidth) {
                    let newSize = currentSize - step;
                    measureCtx.font = getFontString(newSize); // Note: Must Be Set Before Measuring
                    let newWidth = measureCtx.measureText(text).width;
                    if (newWidth < maxWidth && step === 1) {
                        step = 0.1;
                        newSize += 1;
                    }
                    else {
                        currentWidth = newWidth;
                    }
                    currentSize = newSize;
                }
            }
            return getFontString(currentSize);
        }
        setupLocalPlayerAvatar() {
            try {
                const playerAvatarParam = UNITY.WindowManager.GetUrlParameter("avatar");
                if (playerAvatarParam != null && playerAvatarParam !== "" && playerAvatarParam !== "*") {
                    this.defaultAvatar = decodeURIComponent(playerAvatarParam);
                }
            }
            catch (e1) {
                console.error(e1);
            }
            try {
                const playerGenderParam = UNITY.WindowManager.GetUrlParameter("gender");
                if (playerGenderParam != null && playerGenderParam !== "" && playerGenderParam !== "*") {
                    this.avatarGender = decodeURIComponent(playerGenderParam);
                }
            }
            catch (e2) {
                console.error(e2);
            }
            try {
                const playerHandnessParam = UNITY.WindowManager.GetUrlParameter("hand");
                if (playerHandnessParam != null && playerHandnessParam !== "" && playerHandnessParam !== "*") {
                    this.avatarHandness = decodeURIComponent(playerHandnessParam);
                }
            }
            catch (e3) {
                console.error(e3);
            }
            try {
                const playerHandnessParam = UNITY.WindowManager.GetUrlParameter("hand");
                if (playerHandnessParam != null && playerHandnessParam !== "" && playerHandnessParam !== "*") {
                    this.avatarHandness = decodeURIComponent(playerHandnessParam);
                }
            }
            catch (e3) {
                console.error(e3);
            }
            // ..
            // Create Network Entity Attributes
            // ..
            const klass = "PROJECT.ColyseusNetworkEntity";
            let colyseus = UNITY.SceneManager.FindScriptComponent(this.transform, klass);
            if (colyseus == null) {
                if (this.transform.parent != null) {
                    colyseus = UNITY.SceneManager.FindScriptComponent(this.transform.parent, klass);
                    if (colyseus == null) {
                        if (this.transform.parent.parent != null) {
                            colyseus = UNITY.SceneManager.FindScriptComponent(this.transform.parent.parent, klass);
                            if (colyseus == null) {
                                if (this.transform.parent.parent.parent != null) {
                                    colyseus = UNITY.SceneManager.FindScriptComponent(this.transform.parent.parent.parent, klass);
                                }
                            }
                        }
                    }
                }
            }
            if (colyseus != null) {
                if (colyseus.runtimeAttributes == null)
                    colyseus.runtimeAttributes = [];
                colyseus.runtimeAttributes.push({ key: "playerAvatar", value: this.defaultAvatar });
                colyseus.runtimeAttributes.push({ key: "playerGender", value: this.avatarGender });
                colyseus.runtimeAttributes.push({ key: "playerHand", value: this.avatarHandness });
            }
            // ..
            //  Load Runtime Player Avatar Model
            // ..
            if (this.defaultAvatar != null && this.defaultAvatar !== "") {
                if (UNITY.SceneManager.HasSceneBeenPreLoaded(this.scene)) {
                    this.loadRuntimePlayerAvatar(this.defaultAvatar);
                }
                else {
                    this.preloadLocation = this.defaultAvatar;
                }
            }
            else {
                BABYLON.Tools.Warn("Invalid avatar location specified for: " + this.transform.name);
            }
        }
        setupRemotePlayerAvatar() {
            let remoteEntity = this.transform.networkEntity;
            if (remoteEntity == null) {
                if (this.transform.parent != null) {
                    remoteEntity = this.transform.parent.networkEntity;
                    if (remoteEntity == null) {
                        if (this.transform.parent.parent != null) {
                            remoteEntity = this.transform.parent.parent.networkEntity;
                            if (remoteEntity == null) {
                                if (this.transform.parent.parent.parent != null) {
                                    remoteEntity = this.transform.parent.parent.parent.networkEntity;
                                }
                            }
                        }
                    }
                }
            }
            // ..
            // Query Network Entity Attributes
            // ..
            if (remoteEntity != null && remoteEntity.transformNode != null && remoteEntity.transformNodeType != null && remoteEntity.transformNodeType === 2) {
                const playerAvatar = UNITY.EntityController.QueryNetworkAttribute(remoteEntity.transformNode, "playerAvatar");
                if (playerAvatar != null && playerAvatar !== "") {
                    this.defaultAvatar = playerAvatar;
                }
                const playerGender = UNITY.EntityController.QueryNetworkAttribute(remoteEntity.transformNode, "playerGender");
                if (playerGender != null && playerGender !== "") {
                    this.avatarGender = playerGender;
                }
                const playerHand = UNITY.EntityController.QueryNetworkAttribute(remoteEntity.transformNode, "playerHand");
                if (playerHand != null && playerHand !== "") {
                    this.avatarHandness = playerHand;
                }
                const ownerName = UNITY.EntityController.QueryNetworkAttribute(remoteEntity.transformNode, "ownerName");
                if (ownerName != null && ownerName !== "") {
                    this.avatarLabel = ownerName;
                }
            }
            // ..
            //  Load Runtime Player Avatar Model
            // ..
            if (this.defaultAvatar != null && this.defaultAvatar !== "") {
                this.loadRuntimePlayerAvatar(this.defaultAvatar);
            }
            else {
                BABYLON.Tools.Warn("Invalid avatar location specified for: " + this.transform.name);
            }
        }
        configurePlayerAvatarRig(root) {
            if (root != null) {
                const armatures = root.getChildren((node) => { return (node.name === "Armature"); }, false);
                this.avatarLoaded = true;
                this.avatarArmature = (armatures != null && armatures.length > 0) ? armatures[0] : null;
                let shadowList = null;
                let freezeList = null;
                const meshes = root.getChildMeshes(false);
                if (meshes != null && meshes.length > 0) {
                    meshes.forEach((mesh) => {
                        mesh.renderingGroupId = UNITY.Utilities.DefaultRenderGroup();
                    });
                }
                const skins = root.getChildMeshes(false, (node) => { return (node.skeleton != null); });
                if (skins != null && skins.length > 0) {
                    skins.forEach((skin) => {
                        if (this.avatarSkeleton == null && skin.skeleton != null) {
                            this.avatarSkeleton = skin.skeleton;
                        }
                        if (this.castRealtimeShadow === true) {
                            if (shadowList == null)
                                shadowList = [];
                            shadowList.push(skin);
                        }
                        skin.isPickable = true;
                        skin.useVertexColors = false;
                        skin.cullingStrategy = BABYLON.AbstractMesh.CULLINGSTRATEGY_STANDARD;
                        skin.alwaysSelectAsActiveMesh = true; // Note: Always Set For Skin Without Updated Bounding Box Info
                    });
                }
                if (shadowList != null && shadowList.length > 0 && this.scene.lights != null && this.scene.lights.length > 0) {
                    this.scene.lights.forEach((light) => {
                        const shadowgenerator = light.getShadowGenerator();
                        if (shadowgenerator != null && light.metadata != null && light.metadata.unity != null && light.metadata.unity.autorender === true) {
                            const shadowmap = shadowgenerator.getShadowMap();
                            if (shadowmap != null) {
                                if (shadowmap.renderList == null)
                                    shadowmap.renderList = [];
                                shadowList.forEach((mesh) => { shadowmap.renderList.push(mesh); });
                            }
                        }
                    });
                }
                if (freezeList != null && freezeList.length > 0) {
                    freezeList.forEach((mesh) => { mesh.freezeWorldMatrix(); });
                }
                // ..
                // RETARGET ANIMATION GROUPS - (TODO: Blend Shapes)
                // ..
                if (this.avatarSkeleton != null) {
                    const animationRig = (this.avatarGender != null && this.avatarGender.toLowerCase() === "female") ? this.femaleAnimationRig : this.maleAnimationRig;
                    if (animationRig != null && animationRig !== "") {
                        const animationAsset = UNITY.SceneManager.GetAssetContainer(this.scene, animationRig);
                        if (animationAsset != null && animationAsset.animationGroups != null) {
                            let cgroups = null;
                            let xclips = (this.animator != null) ? this.animator.getDefaultClips() : null;
                            animationAsset.animationGroups.forEach((agroup, index) => {
                                try {
                                    agroup.stop();
                                }
                                catch (_a) { }
                                const newname = (this.transform.name + "." + agroup.name);
                                const cgroup = agroup.clone(newname, null, false);
                                if (cgroup != null) {
                                    cgroup.loopAnimation = true;
                                    UNITY.Utilities.RetargetAnimationGroupSkeleton(cgroup, this.avatarSkeleton, this.avatarArmature);
                                    if (this.animator != null && xclips != null) {
                                        const xclip = this.animator.fixAnimationGroup(cgroup);
                                        if (xclip != null) {
                                            if (cgroups == null)
                                                cgroups = [];
                                            cgroups.push(cgroup);
                                        }
                                        else {
                                            BABYLON.Tools.Warn("Failed to locate animation group in default clips: " + cgroup.name);
                                        }
                                    }
                                }
                                else {
                                    BABYLON.Tools.Warn("Failed to clone animation group: " + agroup.name);
                                }
                            });
                            if (this.animator != null && cgroups != null && cgroups.length > 0) {
                                this.animator.setAnimationGroups(cgroups);
                            }
                        }
                    }
                }
                // ..
                // TODO: MOVE BONE SOCKET TRANFORMS - ???
                // ..
                // Dispose Mannequinn Skin And Bones For Performance
                // ..
                if (this.avatarLoaded === true && this.disposeOfMannequin === true) {
                    const children = this.transform.getChildren(null, false);
                    children.forEach((child) => {
                        if (child != null) {
                            if (child instanceof BABYLON.AbstractMesh) {
                                try {
                                    if (child.skeleton != null) {
                                        child.skeleton.dispose();
                                        child.skeleton = null;
                                    }
                                }
                                catch (e3) {
                                    console.error(e3);
                                }
                            }
                        }
                    });
                    const childrenx = this.transform.getChildren(null, true);
                    childrenx.forEach((childx) => {
                        if (childx != null) {
                            try {
                                childx.dispose();
                            }
                            catch (e4) {
                                console.error(e4);
                            }
                        }
                    });
                }
            }
        }
        /** Load runtime player avatar from specfied location */
        loadRuntimePlayerAvatar(url) {
            if (url != null && url !== "") {
                //console.warn(">>> Loading player avatar from: " + url);
                const sceneRootUrl = UNITY.SceneManager.GetRootUrl(this.scene);
                let importUrl = url;
                let rooturl = sceneRootUrl;
                let filename = "";
                rooturl = sceneRootUrl;
                filename = importUrl;
                if (importUrl.indexOf("://") >= 0) {
                    rooturl = importUrl.substring(0, importUrl.lastIndexOf('/')) + "/";
                    filename = importUrl.substring(importUrl.lastIndexOf('/') + 1);
                }
                const assetsManager = new BABYLON.AssetsManager(this.scene);
                const importTask = assetsManager.addMeshTask((this.transform.name + ".MeshTask"), null, rooturl, filename);
                importTask.onSuccess = (task) => {
                    if (task.loadedMeshes != null) {
                        task.loadedMeshes.forEach((mesh) => {
                            if (mesh.material instanceof BABYLON.PBRMaterial) {
                                mesh.material.ambientColor = this.ambientMaterial;
                            }
                        });
                        let rootAvatarMesh = task.loadedMeshes[0];
                        if (rootAvatarMesh != null) {
                            rootAvatarMesh.parent = this.transform.parent;
                            rootAvatarMesh.name = "BlenderAvatar";
                            const meshTaskKey = task.sceneFilename.toString().toLowerCase();
                            UNITY.SceneManager.RegisterImportMeshes(this.scene, meshTaskKey, task.loadedMeshes);
                            this.configurePlayerAvatarRig(rootAvatarMesh);
                        }
                    }
                };
                importTask.onError = (task, message, exception) => { console.error(message, exception); };
                assetsManager.load();
            }
        }
        /** Add asset preloader tasks (https://doc.babylonjs.com/divingDeeper/importers/assetManager) */
        addPreloaderTasks(assetsManager) {
            if (this.preloadLocation != null && this.preloadLocation !== "") {
                //console.warn(">>> Preloading player avatar from: " + this.preloadLocation);
                const sceneRootUrl = UNITY.SceneManager.GetRootUrl(this.scene);
                let importUrl = this.preloadLocation;
                let rooturl = sceneRootUrl;
                let filename = "";
                rooturl = sceneRootUrl;
                filename = importUrl;
                if (importUrl.indexOf("://") >= 0) {
                    rooturl = importUrl.substring(0, importUrl.lastIndexOf('/')) + "/";
                    filename = importUrl.substring(importUrl.lastIndexOf('/') + 1);
                }
                const importTask = assetsManager.addMeshTask((this.transform.name + ".MeshTask"), null, rooturl, filename);
                importTask.onSuccess = (task) => {
                    if (task.loadedMeshes != null) {
                        task.loadedMeshes.forEach((mesh) => {
                            if (mesh.material instanceof BABYLON.PBRMaterial) {
                                mesh.material.ambientColor = this.ambientMaterial;
                            }
                        });
                        let rootAvatarMesh = task.loadedMeshes[0];
                        if (rootAvatarMesh != null) {
                            rootAvatarMesh.parent = this.transform.parent;
                            rootAvatarMesh.name = "BlenderAvatar";
                            const meshTaskKey = task.sceneFilename.toString().toLowerCase();
                            UNITY.SceneManager.RegisterImportMeshes(this.scene, meshTaskKey, task.loadedMeshes);
                            this.configurePlayerAvatarRig(rootAvatarMesh);
                        }
                    }
                };
                importTask.onError = (task, message, exception) => { console.error(message, exception); };
            }
        }
    }
    ColyseusNetworkAvatar.FONT_PADDING = 36;
    ColyseusNetworkAvatar.HEIGHT_PADDING = 0.1;
    PROJECT.ColyseusNetworkAvatar = ColyseusNetworkAvatar;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
     * Babylon network entity (Colyseus Universal Game Room)
     * @class ColyseusNetworkEntity - All rights reserved (c) 2020 Mackey Kinard
     */
    class ColyseusNetworkEntity extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.autoCreate = true;
            this.remotePrefab = null;
            this.assetContainer = null;
            this.movementEpsilon = 0.00001;
            this.movementMethod = BABYLON.EntityMovementType.ClientAuthority;
            this.interpolationMode = BABYLON.EntityInterpolation.Default;
            this.interpolationHandler = null;
            this.syncTransformNode = true;
            this.runtimeAttributes = null;
            this.creationAttributes = null;
            this.bufferedAttributes = null;
            this.networkEntityCreated = false;
        }
        update() {
            if (this.networkEntityCreated === false && this.autoCreate === true && this.isReady()) {
                if (BABYLON.NetworkManager.HasJoinedRoom()) {
                    this.autoCreate = false;
                    this.createEntity();
                }
            }
        }
        destroy() {
            this.autoCreate = false;
            this.movementMethod = 0;
            this.remotePrefab = null;
            this.assetContainer = null;
            this.interpolationMode = 0;
            this.interpolationHandler = null;
            this.creationAttributes = null;
            this.runtimeAttributes = null;
            this.syncTransformNode = false;
            this.networkEntityCreated = true;
            const entityId = UNITY.EntityController.GetNetworkEntityId(this.transform);
            if (entityId != null && entityId !== "")
                BABYLON.NetworkManager.RemoveNetworkEntity(entityId);
        }
        createEntity() {
            const attributesToCreate = {};
            if (this.creationAttributes != null && this.creationAttributes.length > 0) {
                this.creationAttributes.forEach((creationAttribute) => { attributesToCreate[creationAttribute.key] = creationAttribute.value; });
            }
            if (this.runtimeAttributes != null && this.runtimeAttributes.length > 0) {
                this.runtimeAttributes.forEach((runtimeAttribute) => { attributesToCreate[runtimeAttribute.key] = runtimeAttribute.value; });
            }
            const customHandler = (this.interpolationMode === BABYLON.EntityInterpolation.Custom) ? this.interpolationHandler : "";
            BABYLON.NetworkManager.CreateNetworkEntity(this.transform, this.remotePrefab, this.assetContainer, this.movementEpsilon, this.movementMethod, this.interpolationMode, this.syncTransformNode, customHandler, this.bufferedAttributes, attributesToCreate);
            this.networkEntityCreated = true;
        }
    }
    PROJECT.ColyseusNetworkEntity = ColyseusNetworkEntity;
})(PROJECT || (PROJECT = {}));
var BABYLON;
(function (BABYLON) {
    let RemoteFunctionCallTarget;
    (function (RemoteFunctionCallTarget) {
        RemoteFunctionCallTarget[RemoteFunctionCallTarget["All"] = 0] = "All";
        RemoteFunctionCallTarget[RemoteFunctionCallTarget["Others"] = 1] = "Others";
    })(RemoteFunctionCallTarget = BABYLON.RemoteFunctionCallTarget || (BABYLON.RemoteFunctionCallTarget = {}));
    let NetworkEntityType;
    (function (NetworkEntityType) {
        NetworkEntityType[NetworkEntityType["None"] = 0] = "None";
        NetworkEntityType[NetworkEntityType["Local"] = 1] = "Local";
        NetworkEntityType[NetworkEntityType["Remote"] = 2] = "Remote";
    })(NetworkEntityType = BABYLON.NetworkEntityType || (BABYLON.NetworkEntityType = {}));
    let EntityMovementType;
    (function (EntityMovementType) {
        EntityMovementType[EntityMovementType["ClientAuthority"] = 0] = "ClientAuthority";
        EntityMovementType[EntityMovementType["ServerAuthority"] = 1] = "ServerAuthority";
    })(EntityMovementType = BABYLON.EntityMovementType || (BABYLON.EntityMovementType = {}));
    let EntityInterpolation;
    (function (EntityInterpolation) {
        EntityInterpolation[EntityInterpolation["Default"] = 0] = "Default";
        EntityInterpolation[EntityInterpolation["Hermite"] = 1] = "Hermite";
        EntityInterpolation[EntityInterpolation["Custom"] = 2] = "Custom";
    })(EntityInterpolation = BABYLON.EntityInterpolation || (BABYLON.EntityInterpolation = {}));
    class EntityAttribute {
    }
    BABYLON.EntityAttribute = EntityAttribute;
    /**
     * Babylon network management system class (Colyseus Universal Game Room)
     * Supports network users, entities, attributes, remote function calls, custom messages, custom methods and custom room logic modules.
     * @class NetworkManager - All rights reserved (c) 2020 Mackey Kinard
     */
    class NetworkManager {
        static RegisterCustomInterpolationHandler(name, handler) { BABYLON.NetworkManager.CustomHandlerMap.set(name, handler); }
        /** Is the colyseus network library is available */
        static IsAvailable() { return (window.Colyseus !== undefined && window.Colyseus.Client !== undefined); }
        /** Is the default universal game room attached to the scene */
        static IsRoomAttached() { return (BABYLON.NetworkManager.SceneReference != null && BABYLON.NetworkManager.DefaultRoom != null); }
        /** Has client received a join room confirmation message from the default universal game room */
        static HasJoinedRoom() { return (BABYLON.NetworkManager.SceneReference != null && BABYLON.NetworkManager.DefaultRoom != null && BABYLON.NetworkManager.UserReference != null); }
        /** Gets the current user in the default universal game room */
        static GetCurrentUser() { return BABYLON.NetworkManager.UserReference; }
        /** Gets the attached default universal game room */
        static GetDefaultRoom() { return BABYLON.NetworkManager.DefaultRoom; }
        /** Gets the network server time of the attached default universal game room (Seconds) */
        static GetNetworkTime() { return BABYLON.NetworkManager.NetworkServerTime; }
        /** Is local network entity */
        static IsLocalNetworkEntity(entity) { return (BABYLON.NetworkManager.GetNetworkEntityType(entity) === BABYLON.NetworkEntityType.Local); }
        /** Is remote network entity */
        static IsRemoteNetworkEntity(entity) { return (BABYLON.NetworkManager.GetNetworkEntityType(entity) === BABYLON.NetworkEntityType.Remote); }
        /** Gets the network entity type */
        static GetNetworkEntityType(entity) {
            let result = 0;
            const aentity = entity;
            if (aentity.transformNode != null && aentity.transformNodeType != null) {
                result = aentity.transformNodeType;
            }
            return result;
        }
        /** Attaches default universal game room to the specified scene */
        static AttachDefaultRoom(scene, room) {
            BABYLON.NetworkManager.DetachDefaultRoom();
            if (scene != null && room != null) {
                BABYLON.NetworkManager.DefaultRoom = room;
                BABYLON.NetworkManager.SceneReference = scene;
                if (room.state != null && room.state.entities != null) {
                    room.state.entities.onAdd((e, k) => { BABYLON.NetworkManager.AddNetworkEntityHandler(e, k); });
                    room.state.entities.onRemove((e, k) => { BABYLON.NetworkManager.RemoveNetworkEntityHandler(e, k); });
                }
                room.onStateChange.once((state) => { BABYLON.NetworkManager.OnDispatchChatQueueMessages(state); }); // Note: First State Chnage
                room.onStateChange((state) => { BABYLON.NetworkManager.OnDispatchChatQueueMessages(state); }); // Note: State Updated
                room.onMessage("onConnect", (info) => { BABYLON.NetworkManager.OnConnectObservable.notifyObservers(info.user); });
                room.onMessage("onDisconnect", (info) => { BABYLON.NetworkManager.OnDisconnectObservable.notifyObservers(info.user); });
                room.onMessage("onJoin", (info) => { BABYLON.NetworkManager.JoinDefaultRoomHandler(info); BABYLON.NetworkManager.OnJoinRoomObservable.notifyObservers(info.user); });
                room.onMessage("onRFC", (message) => { BABYLON.NetworkManager.OnRemoteProcedureCallObservable.notifyObservers(message); });
                room.onLeave((code) => { BABYLON.NetworkManager.OnLeaveRoomObservable.notifyObservers(code); });
                room.onError((code, message) => { BABYLON.NetworkManager.OnErrorMessageObservable.notifyObservers({ code: code, message: message }); });
                scene.onBeforeRenderObservable.add(BABYLON.NetworkManager.OnSceneBeforeRenderUpdate);
            }
        }
        /** Detaches default universal game room from the scene */
        static DetachDefaultRoom() {
            try {
                try {
                    if (BABYLON.NetworkManager.RootNode != null) {
                        BABYLON.NetworkManager.RootNode.dispose();
                    }
                }
                catch (e0) {
                    console.error(e0);
                }
                try {
                    if (BABYLON.NetworkManager.DefaultRoom != null) {
                        BABYLON.NetworkManager.DefaultRoom.removeAllListeners();
                    }
                }
                catch (e1) {
                    console.error(e1);
                }
                try {
                    if (BABYLON.NetworkManager.NetworkEntityQueue != null) {
                        BABYLON.NetworkManager.NetworkEntityQueue.clear();
                    }
                }
                catch (e2) {
                    console.error(e2);
                }
                try {
                    if (BABYLON.NetworkManager.SceneReference != null) {
                        BABYLON.NetworkManager.SceneReference.onBeforeRenderObservable.removeCallback(BABYLON.NetworkManager.OnSceneBeforeRenderUpdate);
                    }
                }
                catch (e6) {
                    console.error(e6);
                }
            }
            catch (e9) {
                console.error(e9);
            }
            finally {
                BABYLON.NetworkManager.RootNode = null;
                BABYLON.NetworkManager.DefaultRoom = null;
                BABYLON.NetworkManager.UserReference = null;
                BABYLON.NetworkManager.SceneReference = null;
                BABYLON.NetworkManager.NetworkEntityQueue = null;
                BABYLON.NetworkManager.NetworkServerTime = 0;
            }
        }
        /** Gets a network user in the default universal game room */
        static GetNetworkUser(id) {
            let result = null;
            if (BABYLON.NetworkManager.HasJoinedRoom()) {
                if (BABYLON.NetworkManager.DefaultRoom.state != null && BABYLON.NetworkManager.DefaultRoom.state.users != null) {
                    result = BABYLON.NetworkManager.DefaultRoom.state.users.get(id);
                }
            }
            else {
                BABYLON.Tools.Warn("Network manager has not joined the default universal game room.");
            }
            return result;
        }
        /** Gets a network entity in the default universal game room */
        static GetNetworkEntity(id) {
            let result = null;
            if (BABYLON.NetworkManager.HasJoinedRoom()) {
                if (BABYLON.NetworkManager.DefaultRoom.state != null && BABYLON.NetworkManager.DefaultRoom.state.entities != null) {
                    result = BABYLON.NetworkManager.DefaultRoom.state.entities.get(id);
                }
            }
            else {
                BABYLON.Tools.Warn("Network manager has not joined the default universal game room.");
            }
            return result;
        }
        /** Creates a network entity in the default universal game room */
        static CreateNetworkEntity(localTransform, remotePrefab = null, assetContainer = null, movementEpsilon = 0.00001, movementType = BABYLON.EntityMovementType.ClientAuthority, interpolationMode = BABYLON.EntityInterpolation.Default, autoSyncTransform = true, customHandlerName = null, bufferedAttributes, createAttributes = null) {
            if (BABYLON.NetworkManager.HasJoinedRoom()) {
                BABYLON.RoomController.CreateNetworkEntity(BABYLON.NetworkManager.DefaultRoom, BABYLON.NetworkManager.UserReference.name, localTransform, remotePrefab, assetContainer, movementEpsilon, movementType, interpolationMode, autoSyncTransform, customHandlerName, bufferedAttributes, createAttributes);
            }
            else {
                BABYLON.Tools.Warn("Network manager has not joined the default universal game room.");
            }
        }
        /** Removes a network entity from the default universal game room */
        static RemoveNetworkEntity(entityId) {
            if (BABYLON.NetworkManager.HasJoinedRoom()) {
                BABYLON.RoomController.RemoveNetworkEntity(BABYLON.NetworkManager.DefaultRoom, entityId);
            }
            else {
                BABYLON.Tools.Warn("Network manager has not joined the default universal game room.");
            }
        }
        /** Sets a user attribute on the default universal game room */
        static SetUserAttributes(userId, attributesToSet) {
            if (BABYLON.NetworkManager.HasJoinedRoom()) {
                BABYLON.RoomController.SetUserAttributes(BABYLON.NetworkManager.DefaultRoom, userId, attributesToSet);
            }
            else {
                BABYLON.Tools.Warn("Network manager has not joined the default universal game room.");
            }
        }
        /** Sets a entity attribute on the default universal game room */
        static SetEntityAttributes(entityId, attributesToSet) {
            if (BABYLON.NetworkManager.HasJoinedRoom()) {
                BABYLON.RoomController.SetEntityAttributes(BABYLON.NetworkManager.DefaultRoom, entityId, attributesToSet);
            }
            else {
                BABYLON.Tools.Warn("Network manager has not joined the default universal game room.");
            }
        }
        /** Calls a custom server method on the default universal game room */
        static CallCustomMethod(method, ...args) {
            if (BABYLON.NetworkManager.HasJoinedRoom()) {
                BABYLON.RoomController.CallCustomMethod(BABYLON.NetworkManager.DefaultRoom, method, args);
            }
            else {
                BABYLON.Tools.Warn("Network manager has not joined the default universal game room.");
            }
        }
        /** Executs a remote function call on the default universal game room */
        static ExecuteRemoteFunctionCall(target, entityId, func, ...args) {
            if (BABYLON.NetworkManager.HasJoinedRoom()) {
                BABYLON.RoomController.ExecuteRemoteFunctionCall(BABYLON.NetworkManager.DefaultRoom, target, entityId, func, args);
            }
            else {
                BABYLON.Tools.Warn("Network manager has not joined the default universal game room.");
            }
        }
        ////////////////////////////////////////////////////////////////////
        // Game Session Chat Messages
        ////////////////////////////////////////////////////////////////////
        /** Gets the current chat message queue items for the default universal game room */
        static GetChatMessages() {
            let messages = null;
            if (BABYLON.NetworkManager.HasJoinedRoom()) {
                if (BABYLON.NetworkManager.DefaultRoom.state.queue != null) {
                    BABYLON.NetworkManager.DefaultRoom.state.queue.forEach((queue, id) => {
                        if (queue != null && queue.messages != null) {
                            queue.messages.forEach((message, index) => {
                                if (message != null) {
                                    if (messages == null)
                                        messages = [];
                                    messages.push(message);
                                }
                            });
                        }
                    });
                }
            }
            return messages;
        }
        /** Send a chat message to the default universal game room */
        static SendChatMessage(message) {
            if (BABYLON.NetworkManager.HasJoinedRoom()) {
                BABYLON.RoomController.SendChat(BABYLON.NetworkManager.DefaultRoom, message);
            }
            else {
                BABYLON.Tools.Warn("Network manager has not joined the default universal game room.");
            }
        }
        ////////////////////////////////////////////////////////////////////
        // Entity Life Cycle Updates
        ////////////////////////////////////////////////////////////////////
        static OnSceneBeforeRenderUpdate() {
            const deltaTime = UNITY.SceneManager.GetDeltaSeconds(BABYLON.NetworkManager.SceneReference);
            if (BABYLON.NetworkManager.NetworkServerTime > 0) {
                BABYLON.NetworkManager.NetworkServerTime += deltaTime;
            }
            BABYLON.NetworkManager.ProcessNetworkEntities(deltaTime);
        }
        static OnDispatchChatQueueMessages(state) {
            if (BABYLON.NetworkManager.HasJoinedRoom()) {
                let messages = BABYLON.NetworkManager.GetChatMessages();
                if (messages != null && messages.length > 0) {
                    // ..
                    // Sort In Ascending Order
                    // ..
                    messages.sort((left, right) => {
                        if (left.timestamp < right.timestamp)
                            return -1;
                        if (left.timestamp > right.timestamp)
                            return 1;
                        return 0;
                    });
                    // ..
                    // Dispatch Shallow Copies
                    // ..
                    messages.forEach((mx) => {
                        if (mx != null && (mx.dispatched == null || mx.dispatched == false)) {
                            try {
                                if (BABYLON.NetworkManager.OnChatMessageObservable && BABYLON.NetworkManager.OnChatMessageObservable.hasObservers()) {
                                    BABYLON.NetworkManager.OnChatMessageObservable.notifyObservers(Object.assign({}, mx));
                                }
                            }
                            catch (e) {
                                console.error(e);
                            }
                            finally {
                                mx.dispatched = true;
                            }
                        }
                    });
                }
            }
        }
        ////////////////////////////////////////////////////////////////////
        // Entity Scene View Functions (Scene Delta Time)
        ////////////////////////////////////////////////////////////////////
        static ProcessNetworkEntities(deltaTime) {
            if (BABYLON.NetworkManager.HasJoinedRoom()) {
                let transmitPacketBuffer = null;
                BABYLON.NetworkManager.DefaultRoom.state.entities.forEach((entity, key) => {
                    if (entity.transformNode != null && entity.transformNode.networkEntitySync != null && entity.transformNode.networkEntitySync === true && entity.transformNodeType != null) {
                        if (entity.transformNodeType === BABYLON.NetworkEntityType.Local) { // Note: Local Network Entities Only
                            if (entity.transformNode.networkEntityLastPosition == null)
                                entity.transformNode.networkEntityLastPosition = entity.transformNode.position.clone();
                            if (entity.transformNode.position.equalsWithEpsilon(entity.transformNode.networkEntityLastPosition, entity.transformNode.networkEntityEpsilon) === false) {
                                entity.transformNode.position.subtractToRef(entity.transformNode.networkEntityLastPosition, entity.transformNode.networkEntityLinearVelocity);
                                entity.transformNode.networkEntityLinearVelocity.x /= deltaTime;
                                entity.transformNode.networkEntityLinearVelocity.y /= deltaTime;
                                entity.transformNode.networkEntityLinearVelocity.z /= deltaTime;
                            }
                            else {
                                entity.transformNode.networkEntityLinearVelocity.set(0, 0, 0);
                            }
                            entity.transformNode.networkEntityLastPosition.copyFrom(entity.transformNode.position);
                            // ..
                            const packet = BABYLON.NetworkManager.CreateNetworkPacketData(entity.transformNode, true);
                            if (transmitPacketBuffer == null)
                                transmitPacketBuffer = [];
                            if (packet != null)
                                transmitPacketBuffer.push(packet);
                        }
                        else if (entity.transformNodeType === BABYLON.NetworkEntityType.Remote) { // Note: Remote Network Entities Only
                            const buffer = entity.transformNode.networkEntityInterpBuffer;
                            if (buffer != null) {
                                buffer.update(deltaTime * 1000);
                                if (entity.transformNode.networkEntityActivated != null) {
                                    if (entity.transformNode.networkEntityActivated !== true) {
                                        entity.transformNode.networkEntityActivated = true;
                                        entity.transformNode.position = new BABYLON.Vector3(entity.xPos, entity.yPos, entity.zPos);
                                        entity.transformNode.rotationQuaternion = new BABYLON.Quaternion(entity.xRot, entity.yRot, entity.zRot, entity.wRot);
                                        entity.transformNode.setEnabled(true); // Note: Enable Root Node On Initial Activation
                                        console.warn(">>> Activating Remote Entity: " + entity.transformNode.name);
                                    }
                                    else {
                                        BABYLON.NetworkManager.UpdateRemoteEntity(buffer, entity, entity.transformNode, deltaTime);
                                    }
                                }
                            }
                        }
                    }
                });
                // ..
                // TODO: Limit Packet Send - ???
                // ..
                if (transmitPacketBuffer != null && transmitPacketBuffer.length > 0) {
                    BABYLON.NetworkManager.SendDataPacketToServer(transmitPacketBuffer);
                }
            }
        }
        static SendDataPacketToServer(transmitPacketBuffer) {
            const dataPacket = { entities: transmitPacketBuffer };
            if (BABYLON.NetworkManager.DefaultRoom != null) {
                BABYLON.NetworkManager.DefaultRoom.send("packetUpdate", dataPacket);
            }
        }
        static UpdateRemoteEntity(buffer, entity, transform, deltaTime) {
            if (entity == null || transform == null)
                return;
            // ..
            // Update Network Translation
            // ..
            const interpolationMode = transform.networkEntityInterpolate;
            if (interpolationMode === BABYLON.EntityInterpolation.Custom) {
                if (transform.networkEntityHandler != null) {
                    transform.networkEntityHandler(entity, transform, deltaTime);
                }
            }
            else {
                if (buffer.state === BufferState.PLAYING) {
                    transform.position.copyFrom(buffer.position);
                    transform.rotationQuaternion.copyFrom(buffer.quaternion);
                    transform.scaling.copyFrom(buffer.scale);
                }
            }
            // ..
            // Update Buffered Attributes
            // ..
            if (transform.networkEntityAttributeBuffer == null)
                transform.networkEntityAttributeBuffer = {};
            transform.networkEntityAttributeBuffer["0"] = entity.aux00;
            transform.networkEntityAttributeBuffer["1"] = entity.aux01;
            transform.networkEntityAttributeBuffer["2"] = entity.aux02;
            transform.networkEntityAttributeBuffer["3"] = entity.aux03;
            transform.networkEntityAttributeBuffer["4"] = entity.aux04;
            transform.networkEntityAttributeBuffer["5"] = entity.aux05;
            transform.networkEntityAttributeBuffer["6"] = entity.aux06;
            transform.networkEntityAttributeBuffer["7"] = entity.aux07;
            transform.networkEntityAttributeBuffer["8"] = entity.aux08;
            transform.networkEntityAttributeBuffer["9"] = entity.aux09;
            transform.networkEntityAttributeBuffer["10"] = entity.aux10;
            transform.networkEntityAttributeBuffer["11"] = entity.aux11;
            transform.networkEntityAttributeBuffer["12"] = entity.aux12;
            transform.networkEntityAttributeBuffer["13"] = entity.aux13;
            transform.networkEntityAttributeBuffer["14"] = entity.aux14;
            transform.networkEntityAttributeBuffer["15"] = entity.aux15;
            transform.networkEntityAttributeBuffer["16"] = entity.aux16;
            transform.networkEntityAttributeBuffer["17"] = entity.aux17;
            transform.networkEntityAttributeBuffer["18"] = entity.aux18;
            transform.networkEntityAttributeBuffer["19"] = entity.aux19;
        }
        static CreateNetworkPacketData(localTransform, postAttributes = true) {
            let result = null;
            const networkEntity = localTransform.networkEntity;
            if (networkEntity != null) {
                if (localTransform.networkEntityMovement != null && localTransform.networkEntityMovement === BABYLON.EntityMovementType.ClientAuthority) {
                    UNITY.Utilities.GetAbsolutePositionToRef(localTransform, BABYLON.NetworkManager.SendPositionBuffer);
                    UNITY.Utilities.GetAbsoluteRotationToRef(localTransform, BABYLON.NetworkManager.SendRotationBuffer);
                    // ..
                    // BABYLON.NetworkManager.SendPositionBuffer.copyFrom(localTransform.absolutePosition);
                    // BABYLON.NetworkManager.SendRotationBuffer.copyFrom(localTransform.absoluteRotationQuaternion);
                    // ..
                    // BABYLON.NetworkManager.SendPositionBuffer.copyFrom(localTransform.position);
                    // BABYLON.NetworkManager.SendRotationBuffer.copyFrom(localTransform.rotationQuaternion);
                    // ..
                    if (localTransform.networkEntityLinearVelocity != null)
                        BABYLON.NetworkManager.SendLinearBuffer.copyFrom(localTransform.networkEntityLinearVelocity);
                    else
                        BABYLON.NetworkManager.SendLinearBuffer.set(0, 0, 0);
                    if (localTransform.networkEntityAngularVelocity != null)
                        BABYLON.NetworkManager.SendAngularBuffer.copyFrom(localTransform.networkEntityAngularVelocity);
                    else
                        BABYLON.NetworkManager.SendAngularBuffer.set(0, 0, 0);
                    // ..
                    let a00 = 0;
                    let a01 = 0;
                    let a02 = 0;
                    let a03 = 0;
                    let a04 = 0;
                    let a05 = 0;
                    let a06 = 0;
                    let a07 = 0;
                    let a08 = 0;
                    let a09 = 0;
                    let a10 = 0;
                    let a11 = 0;
                    let a12 = 0;
                    let a13 = 0;
                    let a14 = 0;
                    let a15 = 0;
                    let a16 = 0;
                    let a17 = 0;
                    let a18 = 0;
                    let a19 = 0;
                    // ..
                    if (postAttributes === true && localTransform.networkEntityBatch != null) {
                        if (localTransform.networkEntityBatch["0"] != null) {
                            a00 = localTransform.networkEntityBatch["0"];
                        }
                        if (localTransform.networkEntityBatch["1"] != null) {
                            a01 = localTransform.networkEntityBatch["1"];
                        }
                        if (localTransform.networkEntityBatch["2"] != null) {
                            a02 = localTransform.networkEntityBatch["2"];
                        }
                        if (localTransform.networkEntityBatch["3"] != null) {
                            a03 = localTransform.networkEntityBatch["3"];
                        }
                        if (localTransform.networkEntityBatch["4"] != null) {
                            a04 = localTransform.networkEntityBatch["4"];
                        }
                        if (localTransform.networkEntityBatch["5"] != null) {
                            a05 = localTransform.networkEntityBatch["5"];
                        }
                        if (localTransform.networkEntityBatch["6"] != null) {
                            a06 = localTransform.networkEntityBatch["6"];
                        }
                        if (localTransform.networkEntityBatch["7"] != null) {
                            a07 = localTransform.networkEntityBatch["7"];
                        }
                        if (localTransform.networkEntityBatch["8"] != null) {
                            a08 = localTransform.networkEntityBatch["8"];
                        }
                        if (localTransform.networkEntityBatch["9"] != null) {
                            a09 = localTransform.networkEntityBatch["9"];
                        }
                        if (localTransform.networkEntityBatch["10"] != null) {
                            a10 = localTransform.networkEntityBatch["10"];
                        }
                        if (localTransform.networkEntityBatch["11"] != null) {
                            a11 = localTransform.networkEntityBatch["11"];
                        }
                        if (localTransform.networkEntityBatch["12"] != null) {
                            a12 = localTransform.networkEntityBatch["12"];
                        }
                        if (localTransform.networkEntityBatch["13"] != null) {
                            a13 = localTransform.networkEntityBatch["13"];
                        }
                        if (localTransform.networkEntityBatch["14"] != null) {
                            a14 = localTransform.networkEntityBatch["14"];
                        }
                        if (localTransform.networkEntityBatch["15"] != null) {
                            a15 = localTransform.networkEntityBatch["15"];
                        }
                        if (localTransform.networkEntityBatch["16"] != null) {
                            a16 = localTransform.networkEntityBatch["16"];
                        }
                        if (localTransform.networkEntityBatch["17"] != null) {
                            a17 = localTransform.networkEntityBatch["17"];
                        }
                        if (localTransform.networkEntityBatch["18"] != null) {
                            a18 = localTransform.networkEntityBatch["18"];
                        }
                        if (localTransform.networkEntityBatch["19"] != null) {
                            a19 = localTransform.networkEntityBatch["19"];
                        }
                    }
                    // ..
                    // Format Network Entity Update Packet
                    // ..
                    const packet = {};
                    packet.id = networkEntity.id;
                    packet.xPos = BABYLON.NetworkManager.SendPositionBuffer.x;
                    packet.yPos = BABYLON.NetworkManager.SendPositionBuffer.y;
                    packet.zPos = BABYLON.NetworkManager.SendPositionBuffer.z;
                    packet.xRot = BABYLON.NetworkManager.SendRotationBuffer.x;
                    packet.yRot = BABYLON.NetworkManager.SendRotationBuffer.y;
                    packet.zRot = BABYLON.NetworkManager.SendRotationBuffer.z;
                    packet.wRot = BABYLON.NetworkManager.SendRotationBuffer.w;
                    packet.xVel = BABYLON.NetworkManager.SendLinearBuffer.x;
                    packet.yVel = BABYLON.NetworkManager.SendLinearBuffer.y;
                    packet.zVel = BABYLON.NetworkManager.SendLinearBuffer.z;
                    packet.xAng = BABYLON.NetworkManager.SendAngularBuffer.x;
                    packet.yAng = BABYLON.NetworkManager.SendAngularBuffer.y;
                    packet.zAng = BABYLON.NetworkManager.SendAngularBuffer.z;
                    packet.a00 = a00;
                    packet.a01 = a01;
                    packet.a02 = a02;
                    packet.a03 = a03;
                    packet.a04 = a04;
                    packet.a05 = a05;
                    packet.a06 = a06;
                    packet.a07 = a07;
                    packet.a08 = a08;
                    packet.a09 = a09;
                    packet.a10 = a10;
                    packet.a11 = a11;
                    packet.a12 = a12;
                    packet.a13 = a13;
                    packet.a14 = a14;
                    packet.a15 = a15;
                    packet.a16 = a16;
                    packet.a17 = a17;
                    packet.a18 = a18;
                    packet.a19 = a19;
                    packet.speed = BABYLON.NetworkManager.SendLinearBuffer.length();
                    result = packet;
                }
            }
            return result;
        }
        ////////////////////////////////////////////////////////////////////
        // Entity Static Event Handlers
        ////////////////////////////////////////////////////////////////////
        static JoinDefaultRoomHandler(info) {
            BABYLON.NetworkManager.UserReference = info.user;
            BABYLON.NetworkManager.NetworkServerTime = info.serverTime;
            BABYLON.NetworkManager.InterpolationBuffer = info.interpolationBuffer;
            if (BABYLON.NetworkManager.HasJoinedRoom()) {
                BABYLON.Tools.Warn("TCP: You are connected to the default room channel");
            }
        }
        static AddNetworkEntityHandler(entity, key) {
            if (BABYLON.NetworkManager.HasJoinedRoom()) {
                // PROCESS QUEUED NETWORK ENTITIES
                if (BABYLON.NetworkManager.NetworkEntityQueue != null) {
                    BABYLON.NetworkManager.NetworkEntityQueue.forEach((vx, kx) => {
                        BABYLON.NetworkManager.ProcessNetworkEntityHandler(vx, kx);
                    });
                    BABYLON.NetworkManager.NetworkEntityQueue.clear();
                    BABYLON.NetworkManager.NetworkEntityQueue = null;
                }
                // PROCESS NEW NETWORK ENTITY ITEM
                BABYLON.NetworkManager.ProcessNetworkEntityHandler(entity, key);
            }
            else {
                if (BABYLON.NetworkManager.NetworkEntityQueue == null)
                    BABYLON.NetworkManager.NetworkEntityQueue = new Map();
                BABYLON.NetworkManager.NetworkEntityQueue.set(key, entity);
            }
        }
        static ProcessNetworkEntityHandler(entity, key) {
            //console.warn(">>> Add New Network Entity: " + key);
            const aentity = entity;
            const sceneRef = BABYLON.NetworkManager.SceneReference;
            const remotePrefab = entity.attributes.get("remotePrefab");
            const assetContainer = entity.attributes.get("assetContainer");
            const customHandler = entity.attributes.get("customHandler");
            const movementEpsilon = entity.attributes.get("movementEpsilon");
            const movementType = entity.attributes.get("movementType");
            const interoplation = entity.attributes.get("interoplation");
            const bufferedAttribs = entity.attributes.get("bufferedAttribs");
            const syncTransform = entity.attributes.get("syncTransform");
            const playerAvatar = entity.attributes.get("playerAvatar");
            const isLocalEntity = (entity.ownerId === BABYLON.NetworkManager.UserReference.id);
            if (isLocalEntity === false) { // Note: Local Network Entities Only
                aentity.onChange((changes) => { BABYLON.NetworkManager.ProcessRemoteEntityChanges(entity, changes); });
            }
            let sourceName = entity.attributes.get("sourceName");
            if (sourceName == null || sourceName === "")
                sourceName = "Unknown";
            let transformNode = null;
            let transformNodeName = (sourceName + "." + entity.ownerId);
            let transformNodeType = (isLocalEntity === true) ? BABYLON.NetworkEntityType.Local : BABYLON.NetworkEntityType.Remote;
            if (BABYLON.NetworkManager.RootNode == null) {
                BABYLON.NetworkManager.RootNode = new BABYLON.TransformNode("Network Entities", sceneRef);
                BABYLON.NetworkManager.RootNode.position.set(0, 0, 0);
            }
            if (isLocalEntity === false) {
                const initialPosition = new BABYLON.Vector3(0, 0, 0);
                const initialRotation = new BABYLON.Quaternion(0, 0, 0, 1);
                if (remotePrefab != null && remotePrefab !== "") {
                    if (assetContainer != null && assetContainer !== "") {
                        const contaier = UNITY.SceneManager.GetAssetContainer(sceneRef, assetContainer);
                        if (contaier != null) {
                            transformNode = UNITY.SceneManager.InstantiatePrefabFromContainer(contaier, remotePrefab, transformNodeName, BABYLON.NetworkManager.RootNode, initialPosition, initialRotation);
                            if (transformNode == null)
                                BABYLON.Tools.Warn("Failed to instaniate '" + remotePrefab + "' from asset container '" + assetContainer + "'.");
                        }
                        else {
                            BABYLON.Tools.Warn("Asset container '" + assetContainer + "' not registered on the scene.");
                        }
                    }
                    else {
                        transformNode = UNITY.SceneManager.InstantiatePrefabFromScene(sceneRef, remotePrefab, transformNodeName, BABYLON.NetworkManager.RootNode, initialPosition, initialRotation);
                        if (transformNode == null)
                            BABYLON.Tools.Warn("Failed to instaniate '" + remotePrefab + "' from current scene.");
                    }
                }
                if (transformNode == null) {
                    transformNode = new BABYLON.TransformNode(transformNodeName, sceneRef);
                    transformNode.parent = BABYLON.NetworkManager.RootNode;
                    transformNode.position = initialPosition.clone();
                    transformNode.rotationQuaternion = initialRotation.clone();
                }
                transformNode.name = transformNodeName; // Note: Double Check Transform Node Name Is Set
                transformNode.setEnabled(false); // Note: Disable Root Node Until Initial Activation
                // ..
                // Hide Netowrk Avatar Player Armature
                // ..
                if (transformNode != null) {
                    if (playerAvatar != null && playerAvatar !== "") {
                        const skins = transformNode.getChildMeshes(false, (node) => { return (node.skeleton != null); });
                        if (skins != null && skins.length > 0) {
                            skins.forEach((skin) => {
                                const stag = UNITY.SceneManager.GetTransformTag(skin);
                                if (stag != null && stag === "Armature" || skin.name.toLowerCase().endsWith(".skin")) {
                                    skin.isVisible = false;
                                }
                            });
                        }
                    }
                }
            }
            else {
                transformNode = UNITY.SceneManager.GetTransformNodeByID(sceneRef, entity.creationId);
                if (transformNode == null)
                    BABYLON.Tools.Warn("Failed to locate local entity transform '" + entity.creationId + "' in current scene.");
            }
            // ..
            // Validate Custom Interpolation Handler
            // ..
            let customHandlerFunc = null;
            if (customHandler != null && customHandler !== "") {
                customHandlerFunc = BABYLON.NetworkManager.CustomHandlerMap.get(customHandler);
                if (customHandlerFunc == null)
                    BABYLON.Tools.Warn("Custom interoplation handler not found: " + customHandler + ". Default interpolation will be used instead.");
            }
            // ..
            // Link Entity And Transform Node References
            // ..
            if (transformNode != null) {
                aentity.transformNode = transformNode;
                aentity.transformNodeType = transformNodeType;
                aentity.transformNode.networkEntity = entity;
                aentity.transformNode.networkEntityType = transformNodeType;
                aentity.transformNode.networkEntitySync = (syncTransform != null && syncTransform === "true");
                aentity.transformNode.networkEntityBatch = null;
                aentity.transformNode.networkEntityHandler = customHandlerFunc;
                aentity.transformNode.networkEntityEpsilon = (movementEpsilon != null && movementEpsilon !== "") ? parseFloat(movementEpsilon) : 0.00001;
                aentity.transformNode.networkEntityMovement = (movementType != null && movementType !== "") ? parseFloat(movementType) : 0;
                aentity.transformNode.networkEntityInterpolate = (interoplation != null && interoplation !== "") ? parseFloat(interoplation) : 0;
                aentity.transformNode.networkEntityActivated = false;
                aentity.transformNode.networkEntityLastPosition = null;
                aentity.transformNode.networkEntityLinearVelocity = new BABYLON.Vector3(0, 0, 0);
                aentity.transformNode.networkEntityNetworkPosition = new BABYLON.Vector3(0, 0, 0);
                aentity.transformNode.networkEntityNetworkRotation = new BABYLON.Quaternion(0, 0, 0, 1);
                aentity.transformNode.networkEntityNetworkVelocity = new BABYLON.Vector3(0, 0, 0);
                aentity.transformNode.networkEntityNetworkScaling = new BABYLON.Vector3(0, 0, 0);
                aentity.transformNode.networkEntityAttributeBuffer = null;
                aentity.transformNode.networkEntityInterpBuffer = null;
                aentity.transformNode.networkEntityPlayerAvatar = playerAvatar;
                if (transformNodeType == BABYLON.NetworkEntityType.Remote) {
                    const interpolationMode = aentity.transformNode.networkEntityInterpolate;
                    if (interpolationMode !== BABYLON.EntityInterpolation.Custom) {
                        const bufferAttribs = (bufferedAttribs != null && bufferedAttribs !== "") ? JSON.parse(bufferedAttribs) : null;
                        aentity.transformNode.networkEntityInterpBuffer = new InterpolationBuffer(interpolationMode, BABYLON.NetworkManager.InterpolationBuffer, bufferAttribs);
                    }
                }
                else if (transformNodeType == BABYLON.NetworkEntityType.Local) {
                    // TODO: Local Only Setup
                }
            }
            else {
                aentity.transformNode = null;
                aentity.transformNodeType = BABYLON.NetworkEntityType.None;
            }
            BABYLON.NetworkManager.OnCreateEntityObservable.notifyObservers(entity);
        }
        static ProcessRemoteEntityChanges(entity, changes) {
            if (entity != null && entity.transformNode != null && entity.transformNode.networkEntitySync != null && entity.transformNode.networkEntitySync === true && entity.transformNodeType != null) {
                if (entity.transformNodeType === BABYLON.NetworkEntityType.Remote) { // Note: Remote Network Entities Only
                    //console.log("ProcessRemoteEntityChanges: ", entity, changes);
                    entity.transformNode.networkEntityNetworkPosition.set(entity.xPos, entity.yPos, entity.zPos);
                    entity.transformNode.networkEntityNetworkRotation.set(entity.xRot, entity.yRot, entity.zRot, entity.wRot);
                    entity.transformNode.networkEntityNetworkVelocity.set(entity.xVel, entity.yVel, entity.zVel);
                    entity.transformNode.networkEntityNetworkScaling.set(1.0, 1.0, 1.0);
                    if (entity.transformNode.networkEntityInterpBuffer != null) {
                        const position = entity.transformNode.networkEntityNetworkPosition;
                        const rotation = entity.transformNode.networkEntityNetworkRotation;
                        const velocity = entity.transformNode.networkEntityNetworkVelocity;
                        const scaling = entity.transformNode.networkEntityNetworkScaling;
                        entity.transformNode.networkEntityInterpBuffer.appendBuffer(position, velocity, rotation, scaling);
                    }
                }
            }
        }
        static RemoveNetworkEntityHandler(entity, key) {
            const aentity = entity;
            if (aentity.transformNode != null && aentity.transformNodeType != null && aentity.transformNodeType === BABYLON.NetworkEntityType.Remote) {
                // console.warn(">>> Remove Remote Network Entity: " + key);
                if (aentity.transformNode.dispose)
                    aentity.transformNode.dispose();
                aentity.transformNode = null;
                BABYLON.NetworkManager.OnRemoveEntityObservable.notifyObservers(entity);
            }
        }
    }
    NetworkManager.RootNode = null;
    NetworkManager.DefaultRoom = null;
    NetworkManager.UserReference = null;
    NetworkManager.NetworkServerTime = 0;
    NetworkManager.NetworkEntityQueue = null;
    NetworkManager.CustomHandlerMap = new Map();
    NetworkManager.SendPositionBuffer = new BABYLON.Vector3(0, 0, 0);
    NetworkManager.SendRotationBuffer = new BABYLON.Quaternion(0, 0, 0, 1);
    NetworkManager.SendLinearBuffer = new BABYLON.Vector3(0, 0, 0);
    NetworkManager.SendAngularBuffer = new BABYLON.Vector3(0, 0, 0);
    NetworkManager.SceneReference = null;
    NetworkManager.InterpolationBuffer = 0.15;
    NetworkManager.OnConnectObservable = new BABYLON.Observable();
    NetworkManager.OnDisconnectObservable = new BABYLON.Observable();
    NetworkManager.OnJoinRoomObservable = new BABYLON.Observable();
    NetworkManager.OnLeaveRoomObservable = new BABYLON.Observable();
    NetworkManager.OnCreateEntityObservable = new BABYLON.Observable();
    NetworkManager.OnRemoveEntityObservable = new BABYLON.Observable();
    NetworkManager.OnChatMessageObservable = new BABYLON.Observable();
    NetworkManager.OnPingReceivedObservable = new BABYLON.Observable();
    NetworkManager.OnErrorMessageObservable = new BABYLON.Observable();
    NetworkManager.OnRemoteProcedureCallObservable = new BABYLON.Observable();
    BABYLON.NetworkManager = NetworkManager;
    /**
     * Babylon universal game room controller (Colyseus Universal Game Room)
     * Supports network users, entities, attributes, remote function calls, custom messages, custom methods and custom room logic modules.
     * @class RoomController - All rights reserved (c) 2020 Mackey Kinard
     */
    class RoomController {
        static SendPing(room) {
            room.send("ping");
        }
        static SendChat(room, message) {
            room.send("sendChat", { sessionId: "*", name: "*", message: message, timestamp: -1 });
        }
        static CallCustomMethod(room, method, ...args) {
            room.send("customMethod", { method: method, param: args });
        }
        static SetUserAttributes(room, userId, attributesToSet) {
            room.send("setAttribute", { entityId: null, userId: userId, attributesToSet: attributesToSet });
        }
        static SetEntityAttributes(room, entityId, attributesToSet) {
            room.send("setAttribute", { entityId: entityId, userId: null, attributesToSet: attributesToSet });
        }
        static CreateNetworkEntity(room, ownerName, localTransform, remotePrefab = null, assetContainer = null, movementEpsilon = 0.00001, movementType = BABYLON.EntityMovementType.ClientAuthority, interpolationMode = BABYLON.EntityInterpolation.Default, autoSyncTransform = true, customHandlerName = null, bufferedAttributes, createAttributes = null) {
            const entityAttributes = (createAttributes != null) ? createAttributes : {};
            const entityPosition = localTransform.position;
            const entityRotation = (localTransform.rotationQuaternion != null) ? localTransform.rotationQuaternion : BABYLON.Quaternion.FromEulerVector(localTransform.rotation);
            entityAttributes["ownerName"] = ownerName;
            entityAttributes["sourceName"] = (localTransform.name != null) ? localTransform.name : localTransform.id;
            entityAttributes["creationPos"] = [entityPosition.x, entityPosition.y, entityPosition.z];
            entityAttributes["creationRot"] = [entityRotation.x, entityRotation.y, entityRotation.z, entityRotation.w];
            entityAttributes["remotePrefab"] = remotePrefab;
            entityAttributes["assetContainer"] = assetContainer;
            entityAttributes["customHandler"] = customHandlerName;
            entityAttributes["movementEpsilon"] = movementEpsilon.toString();
            entityAttributes["movementType"] = movementType.toString();
            entityAttributes["interoplation"] = interpolationMode.toString();
            entityAttributes["syncTransform"] = autoSyncTransform.toString().toLowerCase();
            entityAttributes["bufferedAttribs"] = (bufferedAttributes != null) ? JSON.stringify(bufferedAttributes) : null;
            room.send("createEntity", { creationId: localTransform.id, attributes: entityAttributes });
        }
        static RemoveNetworkEntity(room, entityId) {
            room.send("removeEntity", entityId);
        }
        static ExecuteRemoteFunctionCall(room, target, entityId, func, ...args) {
            room.send("remoteFunctionCall", { entityId: entityId, function: func, param: args, target: target });
        }
    }
    BABYLON.RoomController = RoomController;
    /**
     * Network Interpolation Buffer
     * https://github.com/virbela/buffered-interpolation
     */
    let BufferState;
    (function (BufferState) {
        BufferState[BufferState["INITIALIZING"] = 0] = "INITIALIZING";
        BufferState[BufferState["BUFFERING"] = 1] = "BUFFERING";
        BufferState[BufferState["PLAYING"] = 2] = "PLAYING";
    })(BufferState = BABYLON.BufferState || (BABYLON.BufferState = {}));
    let BufferMode;
    (function (BufferMode) {
        BufferMode[BufferMode["MODE_LERP"] = 0] = "MODE_LERP";
        BufferMode[BufferMode["MODE_HERMITE"] = 1] = "MODE_HERMITE";
    })(BufferMode = BABYLON.BufferMode || (BABYLON.BufferMode = {}));
    // const vectorPool: Vector3[] = [];
    // const quatPool: Quaternion[] = [];
    const framePool = [];
    // const getPooledVector: () => Vector3 = () => vectorPool.shift() || new Vector3();
    // const getPooledQuaternion: () => Quaternion = () => quatPool.shift() || new Quaternion();
    const getPooledFrame = () => {
        let frame = framePool.pop();
        if (!frame) {
            frame = { position: new BABYLON.Vector3(), velocity: new BABYLON.Vector3(), scale: new BABYLON.Vector3(1, 1, 1), quaternion: new BABYLON.Quaternion(), aux00: 0, aux01: 0, aux02: 0, aux03: 0, aux04: 0, aux05: 0, aux06: 0, aux07: 0, aux08: 0, aux09: 0, aux10: 0, aux11: 0, aux12: 0, aux13: 0, aux14: 0, aux15: 0, aux16: 0, aux17: 0, aux18: 0, aux19: 0, speed: 0, time: 0 };
        }
        return frame;
    };
    const freeFrame = f => framePool.push(f);
    class InterpolationBuffer {
        getPosition() { return this.position; }
        getQuaternion() { return this.quaternion; }
        getScale() { return this.scale; }
        constructor(mode = BufferMode.MODE_LERP, bufferTime = 0.15, bufferAttribs = null) {
            this.state = BufferState.INITIALIZING;
            this.buffer = [];
            this.bufferTime = bufferTime * 1000;
            this.bufferAttribs = bufferAttribs;
            this.time = 0;
            this.mode = mode;
            this.originFrame = getPooledFrame();
            this.position = new BABYLON.Vector3();
            this.quaternion = new BABYLON.Quaternion();
            this.scale = new BABYLON.Vector3(1, 1, 1);
            this.aux00 = 0;
            this.aux01 = 0;
            this.aux02 = 0;
            this.aux03 = 0;
            this.aux04 = 0;
            this.aux05 = 0;
            this.aux06 = 0;
            this.aux07 = 0;
            this.aux08 = 0;
            this.aux09 = 0;
            this.aux10 = 0;
            this.aux11 = 0;
            this.aux12 = 0;
            this.aux13 = 0;
            this.aux14 = 0;
            this.aux15 = 0;
            this.aux16 = 0;
            this.aux17 = 0;
            this.aux18 = 0;
            this.aux19 = 0;
            this.speed = 0;
        }
        hermiteToolkit(target, t, p1, p2, v1, v2) {
            //const deltaTime:number = UNITY.SceneManager.GetDeltaSeconds(BABYLON.NetworkManager.SceneReference);
            UNITY.Utilities.HermiteVector3ToRef(p1, v1, p2, v2, t, target);
        }
        hermiteBabylon(target, t, p1, p2, v1, v2) {
            //const deltaTime:number = UNITY.SceneManager.GetDeltaSeconds(BABYLON.NetworkManager.SceneReference);
            const pos = BABYLON.Vector3.Hermite(p1, v1, p2, v2, t);
            target.copyFrom(pos);
        }
        hermiteLegacy(target, t, p1, p2, v1, v2) {
            const t2 = t * t;
            const t3 = t * t * t;
            const a = 2 * t3 - 3 * t2 + 1;
            const b = -2 * t3 + 3 * t2;
            const c = t3 - 2 * t2 + t;
            const d = t3 - t2;
            target.copyFrom(p1.scaleInPlace(a));
            target.add(p2.scaleInPlace(b));
            target.add(v1.scaleInPlace(c));
            target.add(v2.scaleInPlace(d));
        }
        /* CUBIC HERMOTE REFERENCE (GDSCRIPT)
        func hermite(t, p1, p2, v1, v2):
            var t2 = pow(t, 2)
            var t3 = pow(t, 3)
            var a = 1 - 3*t2 + 2*t3
            var b = t2 * (3 - 2*t)
            var c = t * pow(t - 1, 2)
            var d = t2 * (t - 1)
            return a * p1 + b * p2 + c * v1 + d * v2
        */
        lerp(target, v1, v2, alpha) {
            BABYLON.Vector3.LerpToRef(v1, v2, alpha, target);
        }
        slerp(target, r1, r2, alpha) {
            BABYLON.Quaternion.SlerpToRef(r1, r2, alpha, target);
        }
        updateOriginFrameToBufferTail() {
            freeFrame(this.originFrame);
            this.originFrame = this.buffer.shift() || getPooledFrame();
        }
        appendBuffer(position, velocity, quaternion, scale, aux00 = 0, aux01 = 0, aux02 = 0, aux03 = 0, aux04 = 0, aux05 = 0, aux06 = 0, aux07 = 0, aux08 = 0, aux09 = 0, aux10 = 0, aux11 = 0, aux12 = 0, aux13 = 0, aux14 = 0, aux15 = 0, aux16 = 0, aux17 = 0, aux18 = 0, aux19 = 0, speed = 0) {
            const tail = this.buffer.length > 0 ? this.buffer[this.buffer.length - 1] : null;
            // Update the last entry in the buffer if this is the same frame
            if (tail && tail.time === this.time) {
                if (position)
                    tail.position.copyFrom(position);
                if (velocity)
                    tail.velocity.copyFrom(velocity);
                if (quaternion)
                    tail.quaternion.copyFrom(quaternion);
                if (scale)
                    tail.scale.copyFrom(scale);
                tail.aux00 = aux00;
                tail.aux01 = aux01;
                tail.aux02 = aux02;
                tail.aux03 = aux03;
                tail.aux04 = aux04;
                tail.aux05 = aux05;
                tail.aux06 = aux06;
                tail.aux07 = aux07;
                tail.aux08 = aux08;
                tail.aux09 = aux09;
                tail.aux10 = aux10;
                tail.aux11 = aux11;
                tail.aux12 = aux12;
                tail.aux13 = aux13;
                tail.aux14 = aux14;
                tail.aux15 = aux15;
                tail.aux16 = aux16;
                tail.aux17 = aux17;
                tail.aux18 = aux18;
                tail.aux19 = aux19;
                tail.speed = speed;
            }
            else {
                const priorFrame = tail || this.originFrame;
                const newFrame = getPooledFrame();
                newFrame.position.copyFrom(position || priorFrame.position);
                newFrame.velocity.copyFrom(velocity || priorFrame.velocity);
                newFrame.quaternion.copyFrom(quaternion || priorFrame.quaternion);
                newFrame.scale.copyFrom(scale || priorFrame.scale);
                newFrame.aux00 = aux00;
                newFrame.aux01 = aux01;
                newFrame.aux02 = aux02;
                newFrame.aux03 = aux03;
                newFrame.aux04 = aux04;
                newFrame.aux05 = aux05;
                newFrame.aux06 = aux06;
                newFrame.aux07 = aux07;
                newFrame.aux08 = aux08;
                newFrame.aux09 = aux09;
                newFrame.aux10 = aux10;
                newFrame.aux11 = aux11;
                newFrame.aux12 = aux12;
                newFrame.aux13 = aux13;
                newFrame.aux14 = aux14;
                newFrame.aux15 = aux15;
                newFrame.aux16 = aux16;
                newFrame.aux17 = aux17;
                newFrame.aux18 = aux18;
                newFrame.aux19 = aux19;
                newFrame.speed = speed;
                newFrame.time = this.time;
                this.buffer.push(newFrame);
            }
        }
        // DEEPRECATED: setTarget(position: Vector3, velocity: Vector3, quaternion: Quaternion, scale: Vector3) { this.appendBuffer(position, velocity, quaternion, scale); }
        // DEEPRECATED: setPosition(position: Vector3, velocity: Vector3) { this.appendBuffer(position, velocity, undefined, undefined); }
        // DEEPRECATED: setQuaternion(quaternion: Quaternion) { this.appendBuffer(undefined, undefined, quaternion, undefined); }
        // DEEPRECATED: setScale(scale: Vector3) { this.appendBuffer(undefined, undefined, undefined, scale); }
        update(delta) {
            if (this.state === BufferState.INITIALIZING) {
                if (this.buffer.length > 0) {
                    this.updateOriginFrameToBufferTail();
                    this.position.copyFrom(this.originFrame.position);
                    this.quaternion.copyFrom(this.originFrame.quaternion);
                    this.scale.copyFrom(this.originFrame.scale);
                    this.aux00 = this.originFrame.aux00;
                    this.aux01 = this.originFrame.aux01;
                    this.aux02 = this.originFrame.aux02;
                    this.aux03 = this.originFrame.aux03;
                    this.aux04 = this.originFrame.aux04;
                    this.aux05 = this.originFrame.aux05;
                    this.aux06 = this.originFrame.aux06;
                    this.aux07 = this.originFrame.aux07;
                    this.aux08 = this.originFrame.aux08;
                    this.aux09 = this.originFrame.aux09;
                    this.aux10 = this.originFrame.aux10;
                    this.aux11 = this.originFrame.aux11;
                    this.aux12 = this.originFrame.aux12;
                    this.aux13 = this.originFrame.aux13;
                    this.aux14 = this.originFrame.aux14;
                    this.aux15 = this.originFrame.aux15;
                    this.aux16 = this.originFrame.aux16;
                    this.aux17 = this.originFrame.aux17;
                    this.aux18 = this.originFrame.aux18;
                    this.aux19 = this.originFrame.aux19;
                    this.speed = this.originFrame.speed;
                    this.state = BufferState.BUFFERING;
                }
            }
            if (this.state === BufferState.BUFFERING) {
                if (this.buffer.length > 0 && this.time > this.bufferTime) {
                    this.state = BufferState.PLAYING;
                }
            }
            if (this.state === BufferState.PLAYING) {
                const mark = this.time - this.bufferTime;
                // Purge this.buffer of expired frames
                while (this.buffer.length > 0 && mark > this.buffer[0].time) {
                    // If this is the last frame in the buffer, just update the time and reuse it
                    if (this.buffer.length > 1) {
                        this.updateOriginFrameToBufferTail();
                    }
                    else {
                        this.originFrame.position.copyFrom(this.buffer[0].position);
                        this.originFrame.velocity.copyFrom(this.buffer[0].velocity);
                        this.originFrame.quaternion.copyFrom(this.buffer[0].quaternion);
                        this.originFrame.scale.copyFrom(this.buffer[0].scale);
                        this.originFrame.aux00 = this.buffer[0].aux00;
                        this.originFrame.aux01 = this.buffer[0].aux01;
                        this.originFrame.aux02 = this.buffer[0].aux02;
                        this.originFrame.aux03 = this.buffer[0].aux03;
                        this.originFrame.aux04 = this.buffer[0].aux04;
                        this.originFrame.aux05 = this.buffer[0].aux05;
                        this.originFrame.aux06 = this.buffer[0].aux06;
                        this.originFrame.aux07 = this.buffer[0].aux07;
                        this.originFrame.aux08 = this.buffer[0].aux08;
                        this.originFrame.aux09 = this.buffer[0].aux09;
                        this.originFrame.aux10 = this.buffer[0].aux10;
                        this.originFrame.aux11 = this.buffer[0].aux11;
                        this.originFrame.aux12 = this.buffer[0].aux12;
                        this.originFrame.aux13 = this.buffer[0].aux13;
                        this.originFrame.aux14 = this.buffer[0].aux14;
                        this.originFrame.aux15 = this.buffer[0].aux15;
                        this.originFrame.aux16 = this.buffer[0].aux16;
                        this.originFrame.aux17 = this.buffer[0].aux17;
                        this.originFrame.aux18 = this.buffer[0].aux18;
                        this.originFrame.aux19 = this.buffer[0].aux19;
                        this.originFrame.speed = this.buffer[0].speed;
                        this.originFrame.time = this.buffer[0].time;
                        this.buffer[0].time = this.time + delta;
                    }
                }
                if (this.buffer.length > 0 && this.buffer[0].time > 0) {
                    const targetFrame = this.buffer[0];
                    const delta_time = targetFrame.time - this.originFrame.time;
                    const alpha = (mark - this.originFrame.time) / delta_time;
                    // ..
                    // Network Translation
                    // ..
                    if (this.mode === BufferMode.MODE_LERP) {
                        this.lerp(this.position, this.originFrame.position, targetFrame.position, alpha);
                    }
                    else if (this.mode === BufferMode.MODE_HERMITE) {
                        this.hermiteLegacy(this.position, alpha, this.originFrame.position, targetFrame.position, this.originFrame.velocity.scaleInPlace(delta_time), targetFrame.velocity.scaleInPlace(delta_time));
                        /* TOOLKIT HERMITE
                        this.hermiteToolkit(
                            this.position,
                            alpha,
                            this.originFrame.position,
                            targetFrame.position,
                            this.originFrame.velocity,
                            targetFrame.velocity
                        );*/
                    }
                    this.slerp(this.quaternion, this.originFrame.quaternion, targetFrame.quaternion, alpha);
                    this.lerp(this.scale, this.originFrame.scale, targetFrame.scale, alpha);
                    // ..
                    // Entity Movement Speed
                    // ..
                    this.speed = BABYLON.Scalar.Lerp(this.originFrame.speed, targetFrame.speed, alpha);
                    // ..
                    // Buffered Target Attribs
                    // ..
                    this.aux00 = targetFrame.aux00;
                    this.aux01 = targetFrame.aux01;
                    this.aux02 = targetFrame.aux02;
                    this.aux03 = targetFrame.aux03;
                    this.aux04 = targetFrame.aux04;
                    this.aux05 = targetFrame.aux05;
                    this.aux06 = targetFrame.aux06;
                    this.aux07 = targetFrame.aux07;
                    this.aux08 = targetFrame.aux08;
                    this.aux09 = targetFrame.aux09;
                    this.aux10 = targetFrame.aux10;
                    this.aux11 = targetFrame.aux11;
                    this.aux12 = targetFrame.aux12;
                    this.aux13 = targetFrame.aux13;
                    this.aux14 = targetFrame.aux14;
                    this.aux15 = targetFrame.aux15;
                    this.aux16 = targetFrame.aux16;
                    this.aux17 = targetFrame.aux17;
                    this.aux18 = targetFrame.aux18;
                    this.aux19 = targetFrame.aux19;
                    if (this.bufferAttribs != null) {
                        if (this.bufferAttribs.interpolateBuffer00 === 1)
                            this.aux00 = BABYLON.Scalar.Lerp(this.originFrame.aux00, targetFrame.aux00, alpha);
                        else if (this.bufferAttribs.interpolateBuffer00 === 2)
                            this.aux00 = BABYLON.Scalar.LerpAngle(this.originFrame.aux00, targetFrame.aux00, alpha);
                        if (this.bufferAttribs.interpolateBuffer01 === 1)
                            this.aux01 = BABYLON.Scalar.Lerp(this.originFrame.aux01, targetFrame.aux01, alpha);
                        else if (this.bufferAttribs.interpolateBuffer01 === 2)
                            this.aux01 = BABYLON.Scalar.LerpAngle(this.originFrame.aux01, targetFrame.aux01, alpha);
                        if (this.bufferAttribs.interpolateBuffer02 === 1)
                            this.aux02 = BABYLON.Scalar.Lerp(this.originFrame.aux02, targetFrame.aux02, alpha);
                        else if (this.bufferAttribs.interpolateBuffer02 === 2)
                            this.aux02 = BABYLON.Scalar.LerpAngle(this.originFrame.aux02, targetFrame.aux02, alpha);
                        if (this.bufferAttribs.interpolateBuffer03 === 1)
                            this.aux03 = BABYLON.Scalar.Lerp(this.originFrame.aux03, targetFrame.aux03, alpha);
                        else if (this.bufferAttribs.interpolateBuffer03 === 2)
                            this.aux03 = BABYLON.Scalar.LerpAngle(this.originFrame.aux03, targetFrame.aux03, alpha);
                        if (this.bufferAttribs.interpolateBuffer04 === 1)
                            this.aux04 = BABYLON.Scalar.Lerp(this.originFrame.aux04, targetFrame.aux04, alpha);
                        else if (this.bufferAttribs.interpolateBuffer04 === 2)
                            this.aux04 = BABYLON.Scalar.LerpAngle(this.originFrame.aux04, targetFrame.aux04, alpha);
                        if (this.bufferAttribs.interpolateBuffer05 === 1)
                            this.aux05 = BABYLON.Scalar.Lerp(this.originFrame.aux05, targetFrame.aux05, alpha);
                        else if (this.bufferAttribs.interpolateBuffer05 === 2)
                            this.aux05 = BABYLON.Scalar.LerpAngle(this.originFrame.aux05, targetFrame.aux05, alpha);
                        if (this.bufferAttribs.interpolateBuffer06 === 1)
                            this.aux06 = BABYLON.Scalar.Lerp(this.originFrame.aux06, targetFrame.aux06, alpha);
                        else if (this.bufferAttribs.interpolateBuffer06 === 2)
                            this.aux06 = BABYLON.Scalar.LerpAngle(this.originFrame.aux06, targetFrame.aux06, alpha);
                        if (this.bufferAttribs.interpolateBuffer07 === 1)
                            this.aux07 = BABYLON.Scalar.Lerp(this.originFrame.aux07, targetFrame.aux07, alpha);
                        else if (this.bufferAttribs.interpolateBuffer07 === 2)
                            this.aux07 = BABYLON.Scalar.LerpAngle(this.originFrame.aux07, targetFrame.aux07, alpha);
                        if (this.bufferAttribs.interpolateBuffer08 === 1)
                            this.aux08 = BABYLON.Scalar.Lerp(this.originFrame.aux08, targetFrame.aux08, alpha);
                        else if (this.bufferAttribs.interpolateBuffer08 === 2)
                            this.aux08 = BABYLON.Scalar.LerpAngle(this.originFrame.aux08, targetFrame.aux08, alpha);
                        if (this.bufferAttribs.interpolateBuffer09 === 1)
                            this.aux09 = BABYLON.Scalar.Lerp(this.originFrame.aux09, targetFrame.aux09, alpha);
                        else if (this.bufferAttribs.interpolateBuffer09 === 2)
                            this.aux09 = BABYLON.Scalar.LerpAngle(this.originFrame.aux09, targetFrame.aux09, alpha);
                        if (this.bufferAttribs.interpolateBuffer10 === 1)
                            this.aux10 = BABYLON.Scalar.Lerp(this.originFrame.aux10, targetFrame.aux10, alpha);
                        else if (this.bufferAttribs.interpolateBuffer10 === 2)
                            this.aux10 = BABYLON.Scalar.LerpAngle(this.originFrame.aux10, targetFrame.aux10, alpha);
                        if (this.bufferAttribs.interpolateBuffer11 === 1)
                            this.aux11 = BABYLON.Scalar.Lerp(this.originFrame.aux11, targetFrame.aux11, alpha);
                        else if (this.bufferAttribs.interpolateBuffer11 === 2)
                            this.aux11 = BABYLON.Scalar.LerpAngle(this.originFrame.aux11, targetFrame.aux11, alpha);
                        if (this.bufferAttribs.interpolateBuffer12 === 1)
                            this.aux12 = BABYLON.Scalar.Lerp(this.originFrame.aux12, targetFrame.aux12, alpha);
                        else if (this.bufferAttribs.interpolateBuffer12 === 2)
                            this.aux12 = BABYLON.Scalar.LerpAngle(this.originFrame.aux12, targetFrame.aux12, alpha);
                        if (this.bufferAttribs.interpolateBuffer13 === 1)
                            this.aux13 = BABYLON.Scalar.Lerp(this.originFrame.aux13, targetFrame.aux13, alpha);
                        else if (this.bufferAttribs.interpolateBuffer13 === 2)
                            this.aux13 = BABYLON.Scalar.LerpAngle(this.originFrame.aux13, targetFrame.aux13, alpha);
                        if (this.bufferAttribs.interpolateBuffer14 === 1)
                            this.aux14 = BABYLON.Scalar.Lerp(this.originFrame.aux14, targetFrame.aux14, alpha);
                        else if (this.bufferAttribs.interpolateBuffer14 === 2)
                            this.aux14 = BABYLON.Scalar.LerpAngle(this.originFrame.aux14, targetFrame.aux14, alpha);
                        if (this.bufferAttribs.interpolateBuffer15 === 1)
                            this.aux15 = BABYLON.Scalar.Lerp(this.originFrame.aux15, targetFrame.aux15, alpha);
                        else if (this.bufferAttribs.interpolateBuffer15 === 2)
                            this.aux15 = BABYLON.Scalar.LerpAngle(this.originFrame.aux15, targetFrame.aux15, alpha);
                        if (this.bufferAttribs.interpolateBuffer16 === 1)
                            this.aux16 = BABYLON.Scalar.Lerp(this.originFrame.aux16, targetFrame.aux16, alpha);
                        else if (this.bufferAttribs.interpolateBuffer16 === 2)
                            this.aux16 = BABYLON.Scalar.LerpAngle(this.originFrame.aux16, targetFrame.aux16, alpha);
                        if (this.bufferAttribs.interpolateBuffer17 === 1)
                            this.aux17 = BABYLON.Scalar.Lerp(this.originFrame.aux17, targetFrame.aux17, alpha);
                        else if (this.bufferAttribs.interpolateBuffer17 === 2)
                            this.aux17 = BABYLON.Scalar.LerpAngle(this.originFrame.aux17, targetFrame.aux17, alpha);
                        if (this.bufferAttribs.interpolateBuffer18 === 1)
                            this.aux18 = BABYLON.Scalar.Lerp(this.originFrame.aux18, targetFrame.aux18, alpha);
                        else if (this.bufferAttribs.interpolateBuffer18 === 2)
                            this.aux18 = BABYLON.Scalar.LerpAngle(this.originFrame.aux18, targetFrame.aux18, alpha);
                        if (this.bufferAttribs.interpolateBuffer19 === 1)
                            this.aux19 = BABYLON.Scalar.Lerp(this.originFrame.aux19, targetFrame.aux19, alpha);
                        else if (this.bufferAttribs.interpolateBuffer19 === 2)
                            this.aux19 = BABYLON.Scalar.LerpAngle(this.originFrame.aux19, targetFrame.aux19, alpha);
                    }
                }
            }
            if (this.state !== BufferState.INITIALIZING) {
                this.time += delta;
            }
        }
    }
    BABYLON.InterpolationBuffer = InterpolationBuffer;
})(BABYLON || (BABYLON = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class AutoBodyGarage
    */
    class AutoBodyGarage extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.m_bodyMaterial = null;
            this.m_bodyAbtractMesh = null;
        }
        awake() {
            const mainMaterialIndex = this.getProperty("mainMaterialIndex", 0);
            const mainBodyTransform = this.getProperty("mainBodyTransform");
            const mainBodyUnityColor = this.getProperty("mainBodyPaintColor");
            const mainBodyPaintColor = UNITY.Utilities.ParseColor3(mainBodyUnityColor, BABYLON.Color3.White());
            if (mainBodyTransform != null) {
                this.m_bodyAbtractMesh = UNITY.Utilities.ParseChildTransform(this.transform, mainBodyTransform);
                if (this.m_bodyAbtractMesh != null) {
                    if (this.m_bodyAbtractMesh.material instanceof BABYLON.MultiMaterial) {
                        const multiMaterial = this.m_bodyAbtractMesh.material;
                        if (multiMaterial.subMaterials != null && multiMaterial.subMaterials.length > mainMaterialIndex) {
                            const copyMaterial = multiMaterial.clone(multiMaterial.name + "." + this.transform.name);
                            const subMaterial = copyMaterial.subMaterials[mainMaterialIndex];
                            copyMaterial.subMaterials[mainMaterialIndex] = subMaterial.clone(subMaterial.name + "." + this.transform.name);
                            this.m_bodyMaterial = copyMaterial.subMaterials[mainMaterialIndex];
                            this.m_bodyAbtractMesh.material = copyMaterial;
                        }
                    }
                    else {
                        this.m_bodyMaterial = this.m_bodyAbtractMesh.material.clone(this.m_bodyAbtractMesh.material.name + "." + this.transform.name);
                        this.m_bodyAbtractMesh.material = this.m_bodyMaterial;
                    }
                    if (this.m_bodyMaterial != null) {
                        // Set Main Body Base Coloring
                        if (this.m_bodyMaterial.isFrozen)
                            this.m_bodyMaterial.unfreeze();
                        this.m_bodyMaterial.albedoColor.copyFrom(mainBodyPaintColor);
                        this.m_bodyMaterial.freeze();
                    }
                }
                else {
                    UNITY.SceneManager.LogWarning("Failed to find auto body mesh for: " + this.transform.name);
                }
            }
        }
        //protected start(): void { }
        //protected update(): void { }
        //protected after(): void { }
        //protected destroy(): void { }
        setupVehicleMaterials(bodyColor, wheelColor = null, wheelType = 0, decalIndex = 0) {
            if (this.m_bodyMaterial != null) {
                // Set Main Body Base Coloring
                if (this.m_bodyMaterial.isFrozen)
                    this.m_bodyMaterial.unfreeze();
                this.m_bodyMaterial.albedoColor.copyFrom(bodyColor);
                this.m_bodyMaterial.freeze();
                // TODO - Setup Wheel Type And Color
                // TODO - Setup Decal Body Wrapping
            }
        }
    }
    PROJECT.AutoBodyGarage = AutoBodyGarage;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class CheckpointManager
    */
    class CheckpointManager extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.checkPointList = null;
            this.checkPointCount = 0;
            this.checkPointIndex = 0;
            this.nextCheckPoint = 0;
            this.startRaceTime = 0;
            this.totalRaceTime = 0;
            this.lapNumber = 0;
            this.lapTimer = 0;
            this.lapTimes = null;
            this.playerID = 0;
            this.playerName = "Player";
            this.raceOver = false;
            this.nextCheckPointName = "";
        }
        register(id, name) {
            this.playerID = id;
            this.playerName = name;
            PROJECT.RaceTrackManager.RegisterPlayer(this.playerID, this.playerName);
        }
        getLapTimes() { return this.lapTimes; }
        getLapNumber() { return this.lapNumber; }
        getCheckPoint() { return this.checkPointIndex; }
        getPlayerName() { return this.playerName; }
        getPlayerID() { return this.playerID; }
        getRaceTime() { return this.totalRaceTime; }
        getRaceOver() { return this.raceOver; }
        start() {
            this.lapTimes = [];
            this.lapNumber = 0;
            this.nextCheckPoint = 0;
            this.checkPointList = PROJECT.RaceTrackManager.GetCheckpointList();
            this.checkPointCount = PROJECT.RaceTrackManager.GetCheckpointCount();
        }
        update() {
            if (this.raceOver === false) {
                if (this.checkPointList != null && this.checkPointList.length > 0) {
                    const nextCheckpointMesh = this.checkPointList[this.nextCheckPoint];
                    if (nextCheckpointMesh != null) {
                        this.nextCheckPointName = nextCheckpointMesh.name;
                        if (nextCheckpointMesh.intersectsPoint(this.transform.absolutePosition)) {
                            this.checkPointIndex = this.nextCheckPoint;
                            if (this.checkPointIndex === 0) {
                                if (this.lapNumber > 0 && this.lapTimer > 0) {
                                    const lapTime = (UNITY.SceneManager.GetGameTime() - this.lapTimer);
                                    if (this.lapTimes == null)
                                        this.lapTimes = [];
                                    this.lapTimes.push(lapTime);
                                }
                                this.lapNumber++;
                                this.lapTimer = UNITY.SceneManager.GetGameTime();
                                if (this.lapNumber > PROJECT.RaceTrackManager.TotalLapCount) {
                                    this.startRaceTime = 0;
                                    this.lapNumber = PROJECT.RaceTrackManager.TotalLapCount;
                                    this.raceOver = true; // GAME OVER: Crossed Finish Line
                                    PROJECT.RaceTrackManager.Bus.RaiseMessage("GameOver");
                                    /////////////////////////////////////////////////////////////////////
                                    // Maybe Remove And Use Leaderboard For Winner - ???
                                    /////////////////////////////////////////////////////////////////////
                                    if (PROJECT.RaceTrackManager.WinnerTransform == null) {
                                        PROJECT.RaceTrackManager.WinnerTransform = this.transform;
                                        // ..
                                        // TODO: Handle Win Conditions - ???
                                        // ..
                                        console.warn("RACE WINNER: " + this.transform.name);
                                    }
                                    /////////////////////////////////////////////////////////////////////
                                }
                            }
                            this.nextCheckPoint++;
                            if (this.nextCheckPoint >= this.checkPointCount) {
                                this.nextCheckPoint = 0;
                            }
                        }
                    }
                }
            }
        }
        late() {
            // DEBUG LOCAL PLAYER CHECKPOINTS
            // if (this.transform.name === "LocalPlayer") {
            //    UTIL.PrintToScreen("Checkpoint Index: " + this.checkPointIndex.toString() + " ---> Next: " + this.nextCheckPointName);
            // }
            if (this.raceOver === false) {
                if (this.startRaceTime > 0) {
                    this.totalRaceTime = (UNITY.SceneManager.GetGameTime() - this.startRaceTime);
                }
                if (this.playerID > 0) {
                    PROJECT.RaceTrackManager.UpdateLeaderboard(this.playerID, this.lapNumber, this.checkPointIndex, this.transform.absolutePosition);
                }
            }
        }
        startRaceTimer() {
            if (this.startRaceTime === 0) {
                this.lapTimes = [];
                this.raceOver = false;
                this.startRaceTime = UNITY.SceneManager.GetGameTime();
            }
        }
    }
    PROJECT.CheckpointManager = CheckpointManager;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class NetworkCarPrediction
    */
    class NetworkCarPrediction extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.autoRegister = true;
            this.handlerName = "VehiclePrediction";
            this.extrapolateTimeMs = 200;
        }
        awake() {
            if (this.autoRegister === true)
                this.register();
        }
        register() {
            BABYLON.NetworkManager.RegisterCustomInterpolationHandler(this.handlerName, (networkEntity, remoteTransform, deltaTime) => {
                this.HandleUpdate(networkEntity, remoteTransform, deltaTime);
            });
        }
        HandleUpdate(networkEntity, remoteTransform, deltaTime) {
            // TODO: Handle Remote Network Transform Update
        }
        LegacyHandleUpdate(networkEntity, remoteTransform, deltaTime) {
            const entityDeltaTime = 0; //BABYLON.NetworkManager.ReadNetworkEntityBufferData<number>(remoteTransform, BABYLON.EntityBufferData.DeltaTime);
            const entityElaspedTime = 0; //BABYLON.NetworkManager.ReadNetworkEntityBufferData<number>(remoteTransform, BABYLON.EntityBufferData.ElapsedTime);
            //const extrapolationOffset:BABYLON.Vector3 = BABYLON.NetworkManager.ReadNetworkEntityBufferData<BABYLON.Vector3>(remoteTransform, BABYLON.EntityBufferData.ExtrapolationOffset);
            const entityDeltaTimeMs = (entityDeltaTime * 1000);
            const entityElaspedTimeMs = (entityElaspedTime * 1000);
            //const latestSnapshot:BABYLON.EntitySnapshot = BABYLON.NetworkManager.ReadNetworkEntityBufferData(remoteTransform, BABYLON.EntityBufferData.LatestSnapshot);
            //const networkPosition:BABYLON.Vector3 = latestSnapshot.position;
            //const networkRotation:BABYLON.Quaternion = latestSnapshot.rotation;
            //const networkLinearVelocity:BABYLON.Vector3 = latestSnapshot.velocity; 
            //const networkAngularVelocity:BABYLON.Vector3 = latestSnapshot.angle; 
            /*
            (<any>remoteTransform).networkEntityCurrPosition.copyFrom(remoteTransform.position);
            (<any>remoteTransform).networkEntityCurrPosition.subtractToRef((<any>remoteTransform).networkEntityPrevPosition, (<any>remoteTransform).networkEntityDeltaPosition);
            (<any>remoteTransform).networkEntityPrevPosition.copyFrom((<any>remoteTransform).networkEntityCurrPosition);
            (<any>remoteTransform).networkEntityDeltaPosition.x = (<any>remoteTransform).networkEntityDeltaPosition.x / deltaTime;
            (<any>remoteTransform).networkEntityDeltaPosition.y = (<any>remoteTransform).networkEntityDeltaPosition.y / deltaTime;
            (<any>remoteTransform).networkEntityDeltaPosition.z = (<any>remoteTransform).networkEntityDeltaPosition.z / deltaTime;
            (<any>remoteTransform).networkEntityCurrRotation.copyFrom(remoteTransform.rotationQuaternion);
            // ..
            UNITY.Utilities.QuaternionDiffToRef((<any>remoteTransform).networkEntityCurrRotation, (<any>remoteTransform).networkEntityPrevRotation, (<any>remoteTransform).networkEntityDeltaRotation);
            (<any>remoteTransform).networkEntityDeltaRotation.toEulerAnglesToRef((<any>remoteTransform).networkEntityDeltaEulers);
            (<any>remoteTransform).networkEntityDeltaEulers.x = (<any>remoteTransform).networkEntityDeltaEulers.x / deltaTime;
            (<any>remoteTransform).networkEntityDeltaEulers.y = (<any>remoteTransform).networkEntityDeltaEulers.y / deltaTime;
            (<any>remoteTransform).networkEntityDeltaEulers.z = (<any>remoteTransform).networkEntityDeltaEulers.z / deltaTime;
            */
            if (entityDeltaTimeMs <= this.extrapolateTimeMs && entityElaspedTimeMs <= this.extrapolateTimeMs) {
                // Quaternion turnRotation = Quaternion.Euler( 0, m_SynchronizedTurnSpeed * timePassed, 0 );
                // extrapolatePosition = turnRotation * ( m_SynchronizedSpeed * timePassed );                    
                // ..
                // TODO: Extrapolate New Target Position (Client Prediction)
                // ..
                // const quat:BABYLON.Quaternion = BABYLON.Quaternion.FromEulerAngles(angularVelocity.x, angularVelocity.y, angularVelocity.z);
                // const extra = UNITY.Utilities.MultiplyQuaternionByVector(quat, linearVelocity);
                // ..
                //networkLinearVelocity.scaleToRef(entityDeltaTime, extrapolationOffset);
                //networkPosition.addInPlace(extrapolationOffset);
                // ..
                // Interpolate Smooth Network Position Update (Move Towards)
                // ..
                //const metersPerSecond:number = (networkLinearVelocity.length() * sceneDeltaTime);
                //UNITY.Utilities.MoveTowardsVector3ToRef(remoteTransform.position, networkPosition, metersPerSecond, remoteTransform.position);
                // ..
                // Interpolate Smooth Network Rotation Update (Legacy Slerp)
                // ..
                // TODO: Create Quaternion Rotate Towards
                // TODO: Get Slerp Speed Attribute
                let rotationSlerpFactor = 10.0;
                let rotationLerpSpeed = (rotationSlerpFactor * deltaTime);
                rotationLerpSpeed = BABYLON.Scalar.Clamp(rotationLerpSpeed, 0, 1);
                //BABYLON.Quaternion.SlerpToRef(remoteTransform.rotationQuaternion, networkRotation, rotationLerpSpeed, remoteTransform.rotationQuaternion);
                // MOVE TO ONCHANGE
                //(<any>remoteTransform).networkEntityPacketPosition.copyFrom(remoteTransform.position);
                //(<any>remoteTransform).networkEntityPacketRotation.copyFrom(remoteTransform.rotationQuaternion);
                //(<any>remoteTransform).networkEntityPacketVelocity.copyFrom((<any>remoteTransform).networkEntityDeltaPosition);
                //(<any>remoteTransform).networkEntityPacketAngular.copyFrom((<any>remoteTransform).networkEntityDeltaEulers); 
                /*
                const controlType:BABYLON.EntityControlType = (<any>remoteTransform).networkEntityControl;
                if (controlType != null) {
                    if (controlType === BABYLON.EntityControlType.Transform) {
                        // TODO: Use Transform Directly
                    } else if (controlType === BABYLON.EntityControlType.RigidbodyPhysics) {
                        const remoteTransformMesh:BABYLON.AbstractMesh = remoteTransform as BABYLON.AbstractMesh;
                        if (remoteTransformMesh.physicsImpostor != null) {

                            //const entityDeltaTime:number = BABYLON.NetworkManager.ReadNetworkEntityBufferData<number>(remoteTransform, BABYLON.EntityBufferData.DeltaTime);
                            //(<any>remoteTransform).networkEntityRealVelocity.scaleInPlace(entityDeltaTime);
                            //remoteTransformMesh.physicsImpostor.setLinearVelocity((<any>remoteTransform).networkEntityRealVelocity);
                            //console.log("SET VELOCITY: " + remoteTransform.name);

                            // r.velocity = Vector3.Lerp(velocityAtLastPacket, latestVelocity, (float)(currentTime / timeToReachGoal));
                            // r.angularVelocity = Vector3.Lerp(angularVelocityAtLastPacket, latestAngularVelocity, (float)(currentTime / timeToReachGoal));
                        }
                    } else if (controlType === BABYLON.EntityControlType.CharacterController) {
                        // TODO: Find And Use Character Controller
                    }
                }
                */
            }
            else {
                //remoteTransform.position.copyFrom(networkPosition);
                //remoteTransform.rotationQuaternion.copyFrom(networkRotation);
            }
        }
    }
    PROJECT.NetworkCarPrediction = NetworkCarPrediction;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    class RoutePoint {
    }
    PROJECT.RoutePoint = RoutePoint;
    class PlayerRaceStats {
    }
    PROJECT.PlayerRaceStats = PlayerRaceStats;
    /**
    * Babylon Script Component
    * @class BT_RaceTrackManager
    */
    class RaceTrackManager extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.trackNodes = null;
            this.raceLineData_1 = null;
            this.raceLineData_2 = null;
            this.raceLineData_3 = null;
            this.raceLineData_4 = null;
            this.raceLineData_5 = null;
            this.raceLineColor_1 = null;
            this.raceLineColor_2 = null;
            this.raceLineColor_3 = null;
            this.raceLineColor_4 = null;
            this.raceLineColor_5 = null;
            this.debugMeshLines_1 = null;
            this.debugMeshLines_2 = null;
            this.debugMeshLines_3 = null;
            this.debugMeshLines_4 = null;
            this.debugMeshLines_5 = null;
            this.p0n = 0;
            this.p1n = 0;
            this.p2n = 0;
            this.p3n = 0;
            this.i = 0;
            this.drawDebugLines = false;
        }
        static get Bus() {
            if (PROJECT.RaceTrackManager._EventBus == null) {
                PROJECT.RaceTrackManager._EventBus = new UNITY.EventMessageBus();
            }
            return PROJECT.RaceTrackManager._EventBus;
        }
        getTrackNodes() { return this.trackNodes; }
        getControlPoints(line) {
            let result = null;
            switch (line) {
                case 0:
                    result = this.raceLineData_1;
                    break;
                case 1:
                    result = this.raceLineData_2;
                    break;
                case 2:
                    result = this.raceLineData_3;
                    break;
                case 3:
                    result = this.raceLineData_4;
                    break;
                case 4:
                    result = this.raceLineData_5;
                    break;
            }
            return result;
        }
        awake() {
            this.trackNodes = this.getProperty("TrackNodes", this.trackNodes);
            this.raceLineData_1 = this.getProperty("RaceLineData_1", this.raceLineData_1);
            this.raceLineData_2 = this.getProperty("RaceLineData_2", this.raceLineData_2);
            this.raceLineData_3 = this.getProperty("RaceLineData_3", this.raceLineData_3);
            this.raceLineData_4 = this.getProperty("RaceLineData_4", this.raceLineData_4);
            this.raceLineData_5 = this.getProperty("RaceLineData_5", this.raceLineData_5);
            this.raceLineColor_1 = this.getProperty("RaceLineColor_1", this.raceLineColor_1);
            this.raceLineColor_2 = this.getProperty("RaceLineColor_2", this.raceLineColor_2);
            this.raceLineColor_3 = this.getProperty("RaceLineColor_3", this.raceLineColor_3);
            this.raceLineColor_4 = this.getProperty("RaceLineColor_4", this.raceLineColor_4);
            this.raceLineColor_5 = this.getProperty("RaceLineColor_5", this.raceLineColor_5);
            this.drawDebugLines = this.getProperty("DrawDebugLines", this.drawDebugLines);
            //
            let index = 0;
            if (this.trackNodes != null) {
                PROJECT.RaceTrackManager.TrackLength = 0;
                for (index = 0; index < this.trackNodes.length; index++) {
                    const element = this.trackNodes[index];
                    const t1 = this.trackNodes[(index) % this.trackNodes.length];
                    const t2 = this.trackNodes[(index + 1) % this.trackNodes.length];
                    if (t1 != null && t2 != null) {
                        const rot = UNITY.Utilities.ParseVector4(element.rotation);
                        element.localRotation = new BABYLON.Quaternion(rot.x, rot.y, rot.z, rot.w);
                        element.localPosition = UNITY.Utilities.ParseVector3(element.position);
                        const p1 = UNITY.Utilities.ParseVector3(t1.position);
                        const p2 = UNITY.Utilities.ParseVector3(t2.position);
                        element.localDistance = PROJECT.RaceTrackManager.TrackLength;
                        PROJECT.RaceTrackManager.TrackLength += (p1.subtract(p2)).length();
                    }
                }
            }
            console.warn(">>> Race Track Nodes");
            console.log(this.trackNodes);
            // ..
            if (PROJECT.RaceTrackManager.LeaderBoardList == null) {
                PROJECT.RaceTrackManager.LeaderBoardList = [];
            }
            // ..
            if (PROJECT.RaceTrackManager.CheckPointList == null) {
                PROJECT.RaceTrackManager.CheckPointList = this.scene.getMeshesByTags(PROJECT.RaceTrackManager.CheckPointTag);
                if (PROJECT.RaceTrackManager.CheckPointList != null && PROJECT.RaceTrackManager.CheckPointList.length > 0) {
                    for (index = 0; index < PROJECT.RaceTrackManager.CheckPointList.length; index++) {
                        PROJECT.RaceTrackManager.CheckPointList[index].refreshBoundingInfo();
                    }
                }
            }
        }
        start() {
            if (this.drawDebugLines === true) {
                let index = 0;
                const pointSize = 0.5;
                const debugLines = new BABYLON.TransformNode(this.transform.name + ".DebugLines", this.scene);
                debugLines.position.set(0, 0, 0);
                debugLines.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                // ..
                // Track Nodes
                // ..
                if (this.trackNodes != null && this.trackNodes.length > 0) {
                    const trackNodePos_1 = [];
                    const trackNodeCol_1 = BABYLON.Color3.White();
                    const trackNodeMat_1 = new BABYLON.StandardMaterial(this.transform.name + ".NodeMaterial", this.scene);
                    trackNodeMat_1.diffuseColor = trackNodeCol_1;
                    index = 0;
                    this.trackNodes.forEach((node) => {
                        const trackNodePosition = new BABYLON.Vector3(node.position.x, node.position.y, node.position.z);
                        const trackNodeRotation = new BABYLON.Quaternion(node.rotation.x, node.rotation.y, node.rotation.z, node.rotation.w);
                        trackNodePos_1.push(trackNodePosition);
                        const trackNode = BABYLON.MeshBuilder.CreateCylinder(this.transform.name + ".TrackNode_" + index, { diameterTop: 0, diameterBottom: (pointSize * 2), height: 2.0 }, this.scene);
                        trackNode.parent = debugLines;
                        trackNode.position.copyFrom(trackNodePosition);
                        trackNode.position.y += 0.5;
                        trackNode.rotationQuaternion = trackNodeRotation.multiply(UNITY.Utilities.FromEuler(90, 0, 0));
                        trackNode.material = trackNodeMat_1;
                        index++;
                    });
                }
                // ..
                // Race Line 5
                // ..
                if (this.raceLineData_5 != null && this.raceLineData_5.length > 0) {
                    const raceLinePos_5 = [];
                    const raceLineCol_5 = (this.raceLineColor_5 != null) ? new BABYLON.Color3(this.raceLineColor_5.r, this.raceLineColor_5.g, this.raceLineColor_5.b) : BABYLON.Color3.White();
                    const raceLineMat_5 = new BABYLON.StandardMaterial(this.transform.name + ".PointMaterial_5", this.scene);
                    raceLineMat_5.diffuseColor = raceLineCol_5;
                    index = 0;
                    this.raceLineData_5.forEach((point) => {
                        const raceLinePoint = new BABYLON.Vector3(point.position.x, point.position.y, point.position.z);
                        raceLinePos_5.push(raceLinePoint);
                        const controlPoint_5 = BABYLON.MeshBuilder.CreateSphere(this.transform.name + ".ControlPoint_5_" + index, { segments: 24, diameter: (pointSize * 2) }, this.scene);
                        controlPoint_5.parent = debugLines;
                        controlPoint_5.position.copyFrom(raceLinePoint);
                        controlPoint_5.position.y += 0.5;
                        controlPoint_5.material = raceLineMat_5;
                        index++;
                    });
                    this.debugMeshLines_5 = BABYLON.MeshBuilder.CreateLines((this.transform.name + ".RaceLine_5"), { points: raceLinePos_5 }, this.scene);
                    this.debugMeshLines_5.parent = debugLines;
                    this.debugMeshLines_5.position.y += 0.5;
                    this.debugMeshLines_5.color = raceLineCol_5;
                }
                // ..
                // Race Line 4
                // ..
                if (this.raceLineData_4 != null && this.raceLineData_4.length > 0) {
                    const raceLinePos_4 = [];
                    const raceLineCol_4 = (this.raceLineColor_4 != null) ? new BABYLON.Color3(this.raceLineColor_4.r, this.raceLineColor_4.g, this.raceLineColor_4.b) : BABYLON.Color3.White();
                    const raceLineMat_4 = new BABYLON.StandardMaterial(this.transform.name + ".PointMaterial_4", this.scene);
                    raceLineMat_4.diffuseColor = raceLineCol_4;
                    index = 0;
                    this.raceLineData_4.forEach((point) => {
                        const raceLinePoint = new BABYLON.Vector3(point.position.x, point.position.y, point.position.z);
                        raceLinePos_4.push(raceLinePoint);
                        const controlPoint_4 = BABYLON.MeshBuilder.CreateSphere(this.transform.name + ".ControlPoint_4_" + index, { segments: 24, diameter: (pointSize * 2) }, this.scene);
                        controlPoint_4.parent = debugLines;
                        controlPoint_4.position.copyFrom(raceLinePoint);
                        controlPoint_4.position.y += 0.5;
                        controlPoint_4.material = raceLineMat_4;
                        index++;
                    });
                    this.debugMeshLines_4 = BABYLON.MeshBuilder.CreateLines((this.transform.name + ".RaceLine_4"), { points: raceLinePos_4 }, this.scene);
                    this.debugMeshLines_4.parent = debugLines;
                    this.debugMeshLines_4.position.y += 0.5;
                    this.debugMeshLines_4.color = raceLineCol_4;
                }
                // ..
                // Race Line 3
                // ..
                if (this.raceLineData_3 != null && this.raceLineData_3.length > 0) {
                    const raceLinePos_3 = [];
                    const raceLineCol_3 = (this.raceLineColor_3 != null) ? new BABYLON.Color3(this.raceLineColor_3.r, this.raceLineColor_3.g, this.raceLineColor_3.b) : BABYLON.Color3.White();
                    const raceLineMat_3 = new BABYLON.StandardMaterial(this.transform.name + ".PointMaterial_3", this.scene);
                    raceLineMat_3.diffuseColor = raceLineCol_3;
                    index = 0;
                    this.raceLineData_3.forEach((point) => {
                        const raceLinePoint = new BABYLON.Vector3(point.position.x, point.position.y, point.position.z);
                        raceLinePos_3.push(raceLinePoint);
                        const controlPoint_3 = BABYLON.MeshBuilder.CreateSphere(this.transform.name + ".ControlPoint_3_" + index, { segments: 24, diameter: (pointSize * 2) }, this.scene);
                        controlPoint_3.parent = debugLines;
                        controlPoint_3.position.copyFrom(raceLinePoint);
                        controlPoint_3.position.y += 0.5;
                        controlPoint_3.material = raceLineMat_3;
                        index++;
                    });
                    this.debugMeshLines_3 = BABYLON.MeshBuilder.CreateLines((this.transform.name + ".RaceLine_3"), { points: raceLinePos_3 }, this.scene);
                    this.debugMeshLines_3.parent = debugLines;
                    this.debugMeshLines_3.position.y += 0.5;
                    this.debugMeshLines_3.color = raceLineCol_3;
                }
                // ..
                // Race Line 2
                // ..
                if (this.raceLineData_2 != null && this.raceLineData_2.length > 0) {
                    const raceLinePos_2 = [];
                    const raceLineCol_2 = (this.raceLineColor_2 != null) ? new BABYLON.Color3(this.raceLineColor_2.r, this.raceLineColor_2.g, this.raceLineColor_2.b) : BABYLON.Color3.White();
                    const raceLineMat_2 = new BABYLON.StandardMaterial(this.transform.name + ".PointMaterial_2", this.scene);
                    raceLineMat_2.diffuseColor = raceLineCol_2;
                    index = 0;
                    this.raceLineData_2.forEach((point) => {
                        const raceLinePoint = new BABYLON.Vector3(point.position.x, point.position.y, point.position.z);
                        raceLinePos_2.push(raceLinePoint);
                        const controlPoint_2 = BABYLON.MeshBuilder.CreateSphere(this.transform.name + ".ControlPoint_2_" + index, { segments: 24, diameter: (pointSize * 2) }, this.scene);
                        controlPoint_2.parent = debugLines;
                        controlPoint_2.position.copyFrom(raceLinePoint);
                        controlPoint_2.position.y += 0.5;
                        controlPoint_2.material = raceLineMat_2;
                        index++;
                    });
                    this.debugMeshLines_2 = BABYLON.MeshBuilder.CreateLines((this.transform.name + ".RaceLine_2"), { points: raceLinePos_2 }, this.scene);
                    this.debugMeshLines_2.parent = debugLines;
                    this.debugMeshLines_2.position.y += 0.5;
                    this.debugMeshLines_2.color = raceLineCol_2;
                }
                // ..
                // Race Line 1
                // ..
                if (this.raceLineData_1 != null && this.raceLineData_1.length > 0) {
                    const raceLinePos_1 = [];
                    const raceLineCol_1 = (this.raceLineColor_1 != null) ? new BABYLON.Color3(this.raceLineColor_1.r, this.raceLineColor_1.g, this.raceLineColor_1.b) : BABYLON.Color3.White();
                    const raceLineMat_1 = new BABYLON.StandardMaterial(this.transform.name + ".PointMaterial_1", this.scene);
                    raceLineMat_1.diffuseColor = raceLineCol_1;
                    index = 0;
                    this.raceLineData_1.forEach((point) => {
                        const raceLinePoint = new BABYLON.Vector3(point.position.x, point.position.y, point.position.z);
                        raceLinePos_1.push(raceLinePoint);
                        const controlPoint_1 = BABYLON.MeshBuilder.CreateSphere(this.transform.name + ".ControlPoint_1_" + index, { segments: 24, diameter: (pointSize * 2) }, this.scene);
                        controlPoint_1.parent = debugLines;
                        controlPoint_1.position.copyFrom(raceLinePoint);
                        controlPoint_1.position.y += 0.5;
                        controlPoint_1.material = raceLineMat_1;
                        index++;
                    });
                    this.debugMeshLines_1 = BABYLON.MeshBuilder.CreateLines((this.transform.name + ".RaceLine_1"), { points: raceLinePos_1 }, this.scene);
                    this.debugMeshLines_1.parent = debugLines;
                    this.debugMeshLines_1.position.y += 0.5;
                    this.debugMeshLines_1.color = raceLineCol_1;
                }
            }
        }
        after() {
            if (this.isReady()) { // Update After Ready State
                PROJECT.RaceTrackManager.SortLeaderboardPositionList();
            }
        }
        destroy() {
            // TODO - Destroy component function
        }
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Public Route Point Functions
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        getRoutePoint(distance) {
            const result = new RoutePoint();
            this.getRoutePointToRef(distance, result);
            return result;
        }
        getRoutePointToRef(distance, result) {
            // TODO: OPTIMIZE THIS FUNCTION
            const p1 = this.getRoutePosition(distance);
            const p2 = this.getRoutePosition(distance + 0.1);
            const delta = p2.subtract(p1);
            result.position = p1.clone();
            result.direction = delta.normalizeToNew();
            //return new RoutePoint(p1, delta.normalized);
        }
        getRoutePosition(distance) {
            const result = new BABYLON.Vector3(0, 0, 0);
            this.getRoutePositionToRef(distance, result);
            return result;
        }
        getRoutePositionToRef(distance, result) {
            let point = 0;
            const dist = BABYLON.Scalar.Repeat(distance, PROJECT.RaceTrackManager.TrackLength);
            const numPoints = this.trackNodes.length;
            while (this.trackNodes[point].localDistance < dist) {
                ++point;
            }
            // get nearest two points, ensuring points wrap-around start & end of circuit
            this.p1n = ((point - 1) + numPoints) % numPoints;
            this.p2n = point;
            // found point numbers, now find interpolation value between the two middle points
            this.i = BABYLON.Scalar.InverseLerp(this.trackNodes[this.p1n].localDistance, this.trackNodes[this.p2n].localDistance, dist);
            // simple linear lerp between the two points
            BABYLON.Vector3.LerpToRef(this.trackNodes[this.p1n].localPosition, this.trackNodes[this.p2n].localPosition, this.i, result);
        }
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Static Checkpoint Functions
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /** Gets the checkpoint tag identifier */
        static GetCheckpointTag() {
            return PROJECT.RaceTrackManager.CheckPointTag;
        }
        /** Get the checkpoint position list */
        static GetCheckpointList() {
            return PROJECT.RaceTrackManager.CheckPointList;
        }
        /** Get the total number of checkpoints */
        static GetCheckpointCount() {
            return (PROJECT.RaceTrackManager.CheckPointList != null) ? PROJECT.RaceTrackManager.CheckPointList.length : 0;
        }
        /** Calculates the fraction distance to next checkpoint */
        static GetCheckpointDistance(position, lastPointReached, nextPoint) {
            // TODO: Optimize vectors
            const displacementFromCurrentNode = position.subtract(lastPointReached);
            const currentSegmentVector = nextPoint.subtract(lastPointReached);
            const fraction = BABYLON.Vector3.Dot(displacementFromCurrentNode, currentSegmentVector) / currentSegmentVector.lengthSquared();
            return BABYLON.Scalar.Clamp(fraction);
        }
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Static Vehicle Functions
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /** Register vehicle with track manager */
        static RegisterVehicle(vehicle) {
            if (PROJECT.RaceTrackManager.PlayerVehicleList == null)
                PROJECT.RaceTrackManager.PlayerVehicleList = [];
            PROJECT.RaceTrackManager.PlayerVehicleList.push(vehicle);
        }
        /** Gets the registered player vehicles */
        static GetPlayerVehicles() {
            return PROJECT.RaceTrackManager.PlayerVehicleList;
        }
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Static Leaderboard Functions
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /** Register player with track manager */
        static RegisterPlayer(id, name) {
            const player = new PROJECT.PlayerRaceStats();
            player.id = id,
                player.name = name;
            player.position = 0;
            if (PROJECT.RaceTrackManager.LeaderBoardList == null)
                PROJECT.RaceTrackManager.LeaderBoardList = [];
            PROJECT.RaceTrackManager.LeaderBoardList.push(player);
        }
        /** Update player leaderboard information */
        static UpdateLeaderboard(id, lap, checkpoint, position) {
            if (PROJECT.RaceTrackManager.LeaderBoardList != null && PROJECT.RaceTrackManager.LeaderBoardList.length > 0) {
                const leaderboard = PROJECT.RaceTrackManager.LeaderBoardList;
                for (let index = 0; index < leaderboard.length; index++) {
                    const element = leaderboard[index];
                    if (element.id === id) {
                        if (PROJECT.RaceTrackManager.CheckPointList != null && PROJECT.RaceTrackManager.CheckPointList.length > 0) {
                            let checkPointCount = PROJECT.RaceTrackManager.CheckPointList.length;
                            let nextCheckPointIndex = (checkpoint + 1);
                            if (nextCheckPointIndex >= checkPointCount)
                                nextCheckPointIndex = 0;
                            const startCheckpointMesh = PROJECT.RaceTrackManager.CheckPointList[checkpoint];
                            const nextCheckpointMesh = PROJECT.RaceTrackManager.CheckPointList[nextCheckPointIndex];
                            const checkPointFraction = PROJECT.RaceTrackManager.GetCheckpointDistance(position, startCheckpointMesh.absolutePosition, nextCheckpointMesh.absolutePosition);
                            element.position = (((lap * 1000) + checkpoint) + checkPointFraction);
                        }
                        break;
                    }
                }
            }
        }
        /** Get player leaderboard position */
        static GetLeaderboardPosition(id) {
            let result = -1;
            if (PROJECT.RaceTrackManager.LeaderBoardList != null && PROJECT.RaceTrackManager.LeaderBoardList.length > 0) {
                const leaderboard = PROJECT.RaceTrackManager.LeaderBoardList;
                for (let index = 0; index < leaderboard.length; index++) {
                    const element = leaderboard[index];
                    if (element.id === id) {
                        result = (index + 1);
                        break;
                    }
                }
            }
            return result;
        }
        /** Get leaderboard position list */
        static GetLeaderboardPositionList() {
            return PROJECT.RaceTrackManager.LeaderBoardList;
        }
        /** Sort leaderboard position list */
        static SortLeaderboardPositionList() {
            if (PROJECT.RaceTrackManager.LeaderBoardList != null && PROJECT.RaceTrackManager.LeaderBoardList.length > 0) {
                const leaderboard = PROJECT.RaceTrackManager.LeaderBoardList;
                leaderboard.sort((left, right) => {
                    // Note: Sort In Descending Order
                    if (left.position < right.position)
                        return 1;
                    if (left.position > right.position)
                        return -1;
                    return 0;
                });
            }
        }
    }
    RaceTrackManager.TrackLength = 0;
    RaceTrackManager.TotalLapCount = 3;
    RaceTrackManager.WinnerTransform = null;
    RaceTrackManager.CheckPointTag = "Checkpoint";
    RaceTrackManager.CheckPointList = null;
    RaceTrackManager.LeaderBoardList = null;
    RaceTrackManager.PlayerVehicleList = null;
    RaceTrackManager._EventBus = null;
    PROJECT.RaceTrackManager = RaceTrackManager;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
     * Babylon remote vehicle controller class (Colyseus Universal Game Room)
    * @class RemoteCarController
    */
    class RemoteCarController extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.centerOfMass = 0.4;
            this.burnoutWheelPitch = 0.85;
            this.linkTrackManager = true;
            this.playVehicleSounds = true;
            this.smokeTexture = null;
            this.skidThreashold = 0.65;
            this.smokeIntensity = 150;
            this.wheelDrawVelocity = 0.02;
            this.smokeOpacity = 0.1;
            this.smokeDonuts = 2.0;
            this.steeringWheelHub = null;
            this.steeringWheelAxis = 2;
            this.maxSteeringAngle = 35.0;
            this.maxSteeringSpeed = 10.0;
            this._animator = null;
            this._engineAudioSource = null;
            this._skidAudioSource = null;
            this.brakeLightsMesh = null;
            this.brakeLightsTrans = null;
            this.reverseLightsMesh = null;
            this.reverseLightsTrans = null;
            this.frontLeftWheelTrans = null;
            this.frontRightWheelTrans = null;
            this.backLeftWheelTrans = null;
            this.backRightWheelTrans = null;
            this.frontLeftWheelMesh = null;
            this.frontRightWheelMesh = null;
            this.backLeftWheelMesh = null;
            this.backRightWheelMesh = null;
            this.frontLeftWheelEmitter = null;
            this.frontRightWheelEmitter = null;
            this.backLeftWheelEmitter = null;
            this.backRightWheelEmitter = null;
            this.frontLeftWheelParticle = null;
            this.frontRightWheelParticle = null;
            this.backLeftWheelParticle = null;
            this.backRightWheelParticle = null;
            this.frontLeftContact = false;
            this.frontRightContact = false;
            this.rearLeftContact = false;
            this.rearRightContact = false;
            this.frontLeftContactTag = "";
            this.frontRightContactTag = "";
            this.rearLeftContactTag = "";
            this.rearRightContactTag = "";
            this.frontLeftContactPoint = new BABYLON.Vector3(0, 0, 0);
            this.frontRightContactPoint = new BABYLON.Vector3(0, 0, 0);
            this.rearLeftContactPoint = new BABYLON.Vector3(0, 0, 0);
            this.rearRightContactPoint = new BABYLON.Vector3(0, 0, 0);
            this.frontLeftContactNormal = new BABYLON.Vector3(0, 0, 0);
            this.frontRightContactNormal = new BABYLON.Vector3(0, 0, 0);
            this.rearLeftContactNormal = new BABYLON.Vector3(0, 0, 0);
            this.rearRightContactNormal = new BABYLON.Vector3(0, 0, 0);
            this.frontLeftSensorLine = null;
            this.frontRightSensorLine = null;
            this.rearLeftSensorLine = null;
            this.rearRightSensorLine = null;
            this.startRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            this.endRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            this.smokeIntensityFactor = 0;
            this.downDirection = new BABYLON.Vector3(0, -1, 0);
            this.downDistance = 2.0;
            this.lastPitch = 0;
            this.lastBrake = 0;
            this.lastReverse = 0;
            this.lastBurnout = 0;
            this.lastSteering = 0;
            this.lastSKID_FL = 0;
            this.lastSKID_FR = 0;
            this.lastSKID_RL = 0;
            this.lastSKID_RR = 0;
            this.lastSPIN_FL = 0;
            this.lastSPIN_FR = 0;
            this.lastSPIN_RL = 0;
            this.lastSPIN_RR = 0;
            this.PITCH_FL = 0;
            this.PITCH_FR = 0;
            this.PITCH_RL = 0;
            this.PITCH_RR = 0;
            this.WHEEL_SKID_PITCH = 0;
            this.m_frontLeftWheelSkid = -1;
            this.m_frontRightWheelSkid = -1;
            this.m_backLeftWheelSkid = -1;
            this.m_backRightWheelSkid = -1;
            this.m_velocityOffset = new BABYLON.Vector3(0, 0, 0);
            this.m_linearVelocity = new BABYLON.Vector3(0, 0, 0);
            this.m_lastPosition = new BABYLON.Vector3(0, 0, 0);
            this.m_positionCenter = new BABYLON.Vector3(0, 0, 0);
            this.m_scaledVelocity = 0;
        }
        getFrontLeftWheelContact() { return this.frontLeftContact; }
        getFrontRightWheelContact() { return this.frontRightContact; }
        getRearLeftWheelContact() { return this.rearLeftContact; }
        getRearRightWheelContact() { return this.rearRightContact; }
        getFrontLeftWheelContactTag() { return this.frontLeftContactTag; }
        getFrontRightWheelContactTag() { return this.frontRightContactTag; }
        getRearLeftWheelContactTag() { return this.rearLeftContactTag; }
        getRearRightWheelContactTag() { return this.rearRightContactTag; }
        getFrontLeftWheelContactPoint() { return this.frontLeftContactPoint; }
        getFrontRightWheelContactPoint() { return this.frontRightContactPoint; }
        getRearLeftWheelContactPoint() { return this.rearLeftContactPoint; }
        getRearRightWheelContactPoint() { return this.rearRightContactPoint; }
        getFrontLeftWheelContactNormal() { return this.frontLeftContactNormal; }
        getFrontRightWheelContactNormal() { return this.frontRightContactNormal; }
        getRearLeftWheelContactNormal() { return this.rearLeftContactNormal; }
        getRearRightWheelContactNormal() { return this.rearRightContactNormal; }
        awake() {
            this.centerOfMass = this.getProperty("centerOfMass", this.centerOfMass);
            this.burnoutWheelPitch = this.getProperty("burnoutWheelPitch", this.burnoutWheelPitch);
            this.linkTrackManager = this.getProperty("linkTrackManager", this.linkTrackManager);
            this.playVehicleSounds = this.getProperty("playVehicleSounds", this.playVehicleSounds);
            this.wheelDrawVelocity = this.getProperty("wheelDrawVelocity", this.wheelDrawVelocity);
            this.skidThreashold = this.getProperty("skidThreashold", this.skidThreashold);
            this.smokeIntensity = this.getProperty("smokeIntensity", this.smokeIntensity);
            this.smokeOpacity = this.getProperty("smokeOpacity", this.smokeOpacity);
            this.smokeDonuts = this.getProperty("smokeDonuts", this.smokeDonuts);
            this.steeringWheelAxis = this.getProperty("steeringWheelAxis", this.steeringWheelAxis);
            this.maxSteeringAngle = this.getProperty("maxSteeringAngle", this.maxSteeringAngle);
            this.maxSteeringSpeed = this.getProperty("maxSteeringSpeed", this.maxSteeringSpeed);
            this.frontLeftWheelTrans = this.getProperty("frontLeftWheelMesh", this.frontLeftWheelTrans);
            this.frontRightWheelTrans = this.getProperty("frontRightWheelMesh", this.frontRightWheelTrans);
            this.backLeftWheelTrans = this.getProperty("rearLeftWheelMesh", this.backLeftWheelTrans);
            this.backRightWheelTrans = this.getProperty("rearRightWheelMesh", this.backRightWheelTrans);
            this.brakeLightsTrans = this.getProperty("brakeLightsMesh", this.brakeLightsTrans);
            this.reverseLightsTrans = this.getProperty("reverseLightsMesh", this.reverseLightsTrans);
            const smokeTextureInfo = this.getProperty("smokeTexture");
            if (smokeTextureInfo != null) {
                this.smokeTexture = UNITY.Utilities.ParseTexture(smokeTextureInfo, this.scene);
            }
            if (this.linkTrackManager === true)
                PROJECT.RaceTrackManager.RegisterVehicle(this.transform);
            this._animator = this.getComponent("UNITY.AnimationState");
            if (this._animator == null) {
                const animationNode = this.getChildWithScript("UNITY.AnimationState");
                if (animationNode != null) {
                    this._animator = UNITY.SceneManager.FindScriptComponent(animationNode, "UNITY.AnimationState");
                }
                else {
                    // DEBUG: UNITY.SceneManager.LogWarning("Failed to locate animator node for: " + this.transform);
                }
            }
            this._engineAudioSource = this.getComponent("UNITY.AudioSource");
            if (this._engineAudioSource == null)
                UNITY.SceneManager.LogWarning("No engine audio source manager found for: " + this.transform.name);
            const steeringWheelNode = this.getProperty("steeringWheelHub");
            if (steeringWheelNode != null && steeringWheelNode.name != null && steeringWheelNode.name !== "") {
                this.steeringWheelHub = this.getChildNode(steeringWheelNode.name, UNITY.SearchType.IndexOf, false);
            }
            const brakeLightslName = (this.brakeLightsTrans != null && this.brakeLightsTrans.name != null && this.brakeLightsTrans.name !== "") ? this.brakeLightsTrans.name : null;
            const reverseLightslName = (this.reverseLightsTrans != null && this.reverseLightsTrans.name != null && this.reverseLightsTrans.name !== "") ? this.reverseLightsTrans.name : null;
            const frontLeftWheelName = (this.frontLeftWheelTrans != null && this.frontLeftWheelTrans.name != null && this.frontLeftWheelTrans.name !== "") ? this.frontLeftWheelTrans.name : null;
            const frontRightWheelName = (this.frontRightWheelTrans != null && this.frontRightWheelTrans.name != null && this.frontRightWheelTrans.name !== "") ? this.frontRightWheelTrans.name : null;
            const backLeftWheelName = (this.backLeftWheelTrans != null && this.backLeftWheelTrans.name != null && this.backLeftWheelTrans.name !== "") ? this.backLeftWheelTrans.name : null;
            const backRightWheelName = (this.backRightWheelTrans != null && this.backRightWheelTrans.name != null && this.backRightWheelTrans.name !== "") ? this.backRightWheelTrans.name : null;
            if (brakeLightslName != null) {
                this.brakeLightsMesh = this.getChildNode(brakeLightslName, UNITY.SearchType.IndexOf, false);
                if (this.brakeLightsMesh != null) {
                    this.brakeLightsMesh.isVisible = false;
                }
            }
            if (reverseLightslName != null) {
                this.reverseLightsMesh = this.getChildNode(reverseLightslName, UNITY.SearchType.IndexOf, false);
                if (this.reverseLightsMesh != null) {
                    this.reverseLightsMesh.isVisible = false;
                }
            }
            this.frontLeftWheelMesh = this.getChildNode(frontLeftWheelName, UNITY.SearchType.IndexOf, false);
            if (this.frontLeftWheelMesh != null) {
                this.frontLeftWheelMesh.spinner = UNITY.SceneManager.FindChildTransformNode(this.frontLeftWheelMesh, "Wheel", UNITY.SearchType.IndexOf, true);
                this.frontLeftWheelEmitter = new BABYLON.AbstractMesh("Emitter_FL");
                this.frontLeftWheelEmitter.parent = this.frontLeftWheelMesh.spinner || this.frontLeftWheelMesh;
                this.frontLeftWheelEmitter.position = new BABYLON.Vector3(0, 0, 0);
                this.frontLeftWheelParticle = this.createSmokeParticleSystem(this.transform.name + "Smoke_FL", this.frontLeftWheelEmitter);
            }
            this.frontRightWheelMesh = this.getChildNode(frontRightWheelName, UNITY.SearchType.IndexOf, false);
            if (this.frontRightWheelMesh != null) {
                this.frontRightWheelMesh.spinner = UNITY.SceneManager.FindChildTransformNode(this.frontRightWheelMesh, "Wheel", UNITY.SearchType.IndexOf, true);
                this.frontRightWheelEmitter = new BABYLON.AbstractMesh("Emitter_FR");
                this.frontRightWheelEmitter.parent = this.frontRightWheelMesh.spinner || this.frontRightWheelMesh;
                this.frontRightWheelEmitter.position = new BABYLON.Vector3(0, 0, 0);
                this.frontRightWheelParticle = this.createSmokeParticleSystem(this.transform.name + "Smoke_FR", this.frontRightWheelEmitter);
            }
            this.backLeftWheelMesh = this.getChildNode(backLeftWheelName, UNITY.SearchType.IndexOf, false);
            if (this.backLeftWheelMesh != null) {
                this.backLeftWheelMesh.spinner = UNITY.SceneManager.FindChildTransformNode(this.backLeftWheelMesh, "Wheel", UNITY.SearchType.IndexOf, true);
                this.backLeftWheelEmitter = new BABYLON.AbstractMesh("Emitter_RL");
                this.backLeftWheelEmitter.parent = this.backLeftWheelMesh.spinner || this.backLeftWheelMesh;
                this.backLeftWheelEmitter.position = new BABYLON.Vector3(0, 0, 0);
                this.backLeftWheelParticle = this.createSmokeParticleSystem(this.transform.name + "Smoke_RL", this.backLeftWheelEmitter);
            }
            this.backRightWheelMesh = this.getChildNode(backRightWheelName, UNITY.SearchType.IndexOf, false);
            if (this.backRightWheelMesh != null) {
                this.backRightWheelMesh.spinner = UNITY.SceneManager.FindChildTransformNode(this.backRightWheelMesh, "Wheel", UNITY.SearchType.IndexOf, true);
                this.backRightWheelEmitter = new BABYLON.AbstractMesh("Emitter_RR");
                this.backRightWheelEmitter.parent = this.backRightWheelMesh.spinner || this.backRightWheelMesh;
                this.backRightWheelEmitter.position = new BABYLON.Vector3(0, 0, 0);
                this.backRightWheelParticle = this.createSmokeParticleSystem(this.transform.name + "Smoke_RR", this.backRightWheelEmitter);
            }
            // ..
            // Setup Skid Audio Sources
            // ..
            if (this._skidAudioSource == null && this.backRightWheelMesh != null)
                this._skidAudioSource = UNITY.SceneManager.FindScriptComponent(this.backRightWheelMesh, "UNITY.AudioSource");
            if (this._skidAudioSource == null && this.backLeftWheelMesh != null)
                this._skidAudioSource = UNITY.SceneManager.FindScriptComponent(this.backLeftWheelMesh, "UNITY.AudioSource");
            if (this._skidAudioSource == null && this.frontRightWheelMesh != null)
                this._skidAudioSource = UNITY.SceneManager.FindScriptComponent(this.frontRightWheelMesh, "UNITY.AudioSource");
            if (this._skidAudioSource == null && this.frontLeftWheelMesh != null)
                this._skidAudioSource = UNITY.SceneManager.FindScriptComponent(this.frontLeftWheelMesh, "UNITY.AudioSource");
            if (this._skidAudioSource == null)
                UNITY.SceneManager.LogWarning("No skid audio source manager found for: " + this.transform.name);
        }
        start() {
            this.m_positionCenter.set(0, 0, -this.centerOfMass);
        }
        update() {
            if (UNITY.EntityController.HasNetworkEntity(this.transform)) {
                this.lastPitch = UNITY.EntityController.QueryBufferedAttribute(this.transform, 0); // Pitch
                this.lastBrake = UNITY.EntityController.QueryBufferedAttribute(this.transform, 1); // Brake
                this.lastReverse = UNITY.EntityController.QueryBufferedAttribute(this.transform, 2); // Reverse
                this.lastBurnout = UNITY.EntityController.QueryBufferedAttribute(this.transform, 3); // Burnout
                this.lastSKID_FL = UNITY.EntityController.QueryBufferedAttribute(this.transform, 4); // SKID_FL
                this.lastSKID_FR = UNITY.EntityController.QueryBufferedAttribute(this.transform, 5); // SKID_FR
                this.lastSKID_RL = UNITY.EntityController.QueryBufferedAttribute(this.transform, 6); // SKID_RL
                this.lastSKID_RR = UNITY.EntityController.QueryBufferedAttribute(this.transform, 7); // SKID_RR
                this.lastSPIN_FL = UNITY.EntityController.QueryBufferedAttribute(this.transform, 8); // SPIN_FL
                this.lastSPIN_FR = UNITY.EntityController.QueryBufferedAttribute(this.transform, 9); // SPIN_FR
                this.lastSPIN_RL = UNITY.EntityController.QueryBufferedAttribute(this.transform, 10); // SPIN_RL
                this.lastSPIN_RR = UNITY.EntityController.QueryBufferedAttribute(this.transform, 11); // SPIN_RR
                this.lastSteering = UNITY.EntityController.QueryBufferedAttribute(this.transform, 12); // Steering
            }
            this.updateVehicleProperties();
        }
        destroy() {
            /* Destroy component function */
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Private Worker Functions
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        updateVehicleProperties() {
            //UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.transform.position, this.m_positionCenter); // Note: This Correct Center Of Mass Offset
            this.m_linearVelocity = this.transform.absolutePosition.subtract(this.m_lastPosition);
            this.m_scaledVelocity = (this.m_linearVelocity.length() / this.getDeltaSeconds());
            this.m_linearVelocity.normalize();
            this.m_linearVelocity.scaleInPlace(this.m_scaledVelocity);
            if (this.wheelDrawVelocity > 0) {
                this.m_velocityOffset.copyFrom(this.m_linearVelocity);
                this.m_velocityOffset.scaleInPlace(this.wheelDrawVelocity);
            }
            else {
                this.m_velocityOffset.set(0, 0, 0);
            }
            this.m_lastPosition.copyFrom(this.transform.absolutePosition);
            this.castWheelContactRays();
            // ..
            // Update Engine Pitching
            // ..
            if (this.playVehicleSounds === true) {
                if (this._engineAudioSource != null) {
                    const engineSoundClip = this._engineAudioSource.getSoundClip();
                    if (engineSoundClip != null)
                        engineSoundClip.setPlaybackRate(this.lastPitch);
                }
            }
            const SPIN_FL_Transform = this.frontLeftWheelMesh.spinner;
            const SPIN_FR_Transform = this.frontRightWheelMesh.spinner;
            const SPIN_RL_Transform = this.backLeftWheelMesh.spinner;
            const SPIN_RR_Transform = this.backRightWheelMesh.spinner;
            if (SPIN_FL_Transform != null && SPIN_FL_Transform.rotationQuaternion != null) {
                const SPIN_FL_Rotation = BABYLON.Quaternion.FromEulerAngles(this.lastSPIN_FL, 0, 0);
                BABYLON.Quaternion.SlerpToRef(SPIN_FL_Transform.rotationQuaternion, SPIN_FL_Rotation, 0.5, SPIN_FL_Transform.rotationQuaternion);
            }
            if (SPIN_FR_Transform != null && SPIN_FR_Transform.rotationQuaternion != null) {
                const SPIN_FR_Rotation = BABYLON.Quaternion.FromEulerAngles(this.lastSPIN_FR, 0, 0);
                BABYLON.Quaternion.SlerpToRef(SPIN_FR_Transform.rotationQuaternion, SPIN_FR_Rotation, 0.5, SPIN_FR_Transform.rotationQuaternion);
            }
            if (SPIN_RL_Transform != null && SPIN_RL_Transform.rotationQuaternion != null) {
                const SPIN_RL_Rotation = BABYLON.Quaternion.FromEulerAngles(this.lastSPIN_RL, 0, 0);
                BABYLON.Quaternion.SlerpToRef(SPIN_RL_Transform.rotationQuaternion, SPIN_RL_Rotation, 0.5, SPIN_RL_Transform.rotationQuaternion);
            }
            if (SPIN_RR_Transform != null && SPIN_RR_Transform.rotationQuaternion != null) {
                const SPIN_RR_Rotation = BABYLON.Quaternion.FromEulerAngles(this.lastSPIN_RR, 0, 0);
                BABYLON.Quaternion.SlerpToRef(SPIN_RR_Transform.rotationQuaternion, SPIN_RR_Rotation, 0.5, SPIN_RR_Transform.rotationQuaternion);
            }
            // ..
            // Update Smoke Instensity
            // ..
            this.smokeDonuts = BABYLON.Scalar.Clamp(this.smokeDonuts, 1, 10);
            this.smokeIntensityFactor = this.smokeIntensity;
            if (this.lastBurnout > 0)
                this.smokeIntensityFactor *= this.smokeDonuts;
            // ..
            // Update Front Left Wheel
            // ..
            if (this.lastSKID_FL > 0 && this.frontLeftContact === true) {
                const skidScaleFL = BABYLON.Scalar.Normalize(this.lastSKID_FL, this.skidThreashold, 1.0);
                this.m_frontLeftWheelSkid = PROJECT.SkidMarkManager.AddSkidMarkSegment(this.frontLeftContactPoint, this.frontLeftContactNormal, skidScaleFL, this.m_frontLeftWheelSkid);
                if (this.frontLeftWheelParticle != null) {
                    if (this.frontLeftWheelParticle.isStarted() === false) {
                        this.frontLeftWheelParticle.start();
                    }
                    const smoke_FL = this.lastSKID_FL * this.lastSKID_FL;
                    this.frontLeftWheelParticle.emitRate = this.smokeIntensityFactor * smoke_FL;
                    this.frontLeftWheelParticle.minSize = 0.2 * smoke_FL + 0.2;
                    this.frontLeftWheelParticle.maxSize = 1.5 * smoke_FL + 1.2;
                }
            }
            else {
                if (this.frontLeftWheelParticle != null)
                    this.frontLeftWheelParticle.emitRate = 0;
                this.m_frontLeftWheelSkid = -1;
            }
            // ..
            // Update Front Right Wheel
            // ..
            if (this.lastSKID_FR > 0 && this.frontRightContact === true) {
                const skidScaleFR = BABYLON.Scalar.Normalize(this.lastSKID_FR, this.skidThreashold, 1.0);
                this.m_frontRightWheelSkid = PROJECT.SkidMarkManager.AddSkidMarkSegment(this.frontRightContactPoint, this.frontRightContactNormal, skidScaleFR, this.m_frontRightWheelSkid);
                if (this.frontRightWheelParticle != null) {
                    if (this.frontRightWheelParticle.isStarted() === false) {
                        this.frontRightWheelParticle.start();
                    }
                    const smoke_FR = this.lastSKID_FR * this.lastSKID_FR;
                    this.frontRightWheelParticle.emitRate = this.smokeIntensityFactor * smoke_FR;
                    this.frontRightWheelParticle.minSize = 0.2 * smoke_FR + 0.2;
                    this.frontRightWheelParticle.maxSize = 1.5 * smoke_FR + 1.2;
                }
            }
            else {
                if (this.frontRightWheelParticle != null)
                    this.frontRightWheelParticle.emitRate = 0;
                this.m_frontRightWheelSkid = -1;
            }
            this.PITCH_FL = this.lastSKID_FL;
            this.PITCH_FR = this.lastSKID_FR;
            if (this.lastBurnout > 0) {
                this.PITCH_FL *= this.burnoutWheelPitch;
                this.PITCH_FR *= this.burnoutWheelPitch;
            }
            this.PITCH_FL *= 0.75; // 75% Skid For Front Wheels
            this.PITCH_FR *= 0.75; // 75% Skid For Front Wheels
            // ..
            // Update Rear Left Wheel
            // ..
            if (this.lastSKID_RL > 0 && this.rearLeftContact === true) {
                const skidScaleRL = BABYLON.Scalar.Normalize(this.lastSKID_RL, this.skidThreashold, 1.0);
                this.m_backLeftWheelSkid = PROJECT.SkidMarkManager.AddSkidMarkSegment(this.rearLeftContactPoint, this.rearLeftContactNormal, skidScaleRL, this.m_backLeftWheelSkid);
                if (this.backLeftWheelParticle != null) {
                    if (this.backLeftWheelParticle.isStarted() === false) {
                        this.backLeftWheelParticle.start();
                    }
                    const smoke_RL = this.lastSKID_RL * this.lastSKID_RL;
                    this.backLeftWheelParticle.emitRate = this.smokeIntensityFactor * smoke_RL;
                    this.backLeftWheelParticle.minSize = 0.2 * smoke_RL + 0.2;
                    this.backLeftWheelParticle.maxSize = 1.5 * smoke_RL + 1.2;
                }
            }
            else {
                if (this.backLeftWheelParticle != null)
                    this.backLeftWheelParticle.emitRate = 0;
                this.m_backLeftWheelSkid = -1;
            }
            // ..
            // Update Rear Right Wheel
            // ..
            if (this.lastSKID_RR > 0 && this.rearRightContact === true) {
                const skidScaleRR = BABYLON.Scalar.Normalize(this.lastSKID_RR, this.skidThreashold, 1.0);
                this.m_backRightWheelSkid = PROJECT.SkidMarkManager.AddSkidMarkSegment(this.rearRightContactPoint, this.rearRightContactNormal, skidScaleRR, this.m_backRightWheelSkid);
                if (this.backRightWheelParticle != null) {
                    if (this.backRightWheelParticle.isStarted() === false) {
                        this.backRightWheelParticle.start();
                    }
                    const smoke_RR = this.lastSKID_RR * this.lastSKID_RR;
                    this.backRightWheelParticle.emitRate = this.smokeIntensityFactor * smoke_RR;
                    this.backRightWheelParticle.minSize = 0.2 * smoke_RR + 0.2;
                    this.backRightWheelParticle.maxSize = 1.5 * smoke_RR + 1.2;
                }
            }
            else {
                if (this.backRightWheelParticle != null)
                    this.backRightWheelParticle.emitRate = 0;
                this.m_backRightWheelSkid = -1;
            }
            this.PITCH_RL = this.lastSKID_RL;
            this.PITCH_RR = this.lastSKID_RR;
            if (this.lastBurnout > 0) {
                this.PITCH_RL *= this.burnoutWheelPitch;
                this.PITCH_RR *= this.burnoutWheelPitch;
            }
            ///////////////////////////////////////////
            // Play Skid Audio Track
            ///////////////////////////////////////////
            this.WHEEL_SKID_PITCH = 0;
            if (this.PITCH_FL > this.WHEEL_SKID_PITCH)
                this.WHEEL_SKID_PITCH = this.PITCH_FL;
            if (this.PITCH_FR > this.WHEEL_SKID_PITCH)
                this.WHEEL_SKID_PITCH = this.PITCH_FR;
            if (this.PITCH_RL > this.WHEEL_SKID_PITCH)
                this.WHEEL_SKID_PITCH = this.PITCH_RL;
            if (this.PITCH_RR > this.WHEEL_SKID_PITCH)
                this.WHEEL_SKID_PITCH = this.PITCH_RR;
            if (this.playVehicleSounds === true) {
                if (this._skidAudioSource != null) {
                    const skidSoundClip = this._skidAudioSource.getSoundClip();
                    if (skidSoundClip != null)
                        skidSoundClip.setPlaybackRate(this.WHEEL_SKID_PITCH);
                }
            }
            ///////////////////////////////////////////
            // Vehicle Steering Wheel Sync
            ///////////////////////////////////////////
            if (this.steeringWheelHub != null) {
                if (this.steeringWheelHub.rotationQuaternion == null) {
                    this.steeringWheelHub.rotationQuaternion = BABYLON.Quaternion.FromEulerVector(this.steeringWheelHub.rotation);
                }
                const degreesSteerAngle = (this.lastSteering * this.maxSteeringAngle);
                const radiansSteerAngle = BABYLON.Tools.ToRadians(degreesSteerAngle);
                const xaxis = (this.steeringWheelAxis === 0) ? radiansSteerAngle : 0;
                const yaxis = (this.steeringWheelAxis === 1) ? radiansSteerAngle : 0;
                const zaxis = (this.steeringWheelAxis === 2) ? radiansSteerAngle : 0;
                BABYLON.Quaternion.FromEulerAnglesToRef(xaxis, yaxis, zaxis, this.steeringWheelHub.rotationQuaternion);
            }
            if (this._animator != null)
                this._animator.setFloat("TurnAngle", this.lastSteering);
            ///////////////////////////////////////////
            // Vehicle Braking Lights Check
            ///////////////////////////////////////////
            if (this.brakeLightsMesh != null) {
                this.brakeLightsMesh.isVisible = (this.lastBrake > 0);
            }
            ///////////////////////////////////////////
            // Vehicle Reverse Lights Check
            ///////////////////////////////////////////
            if (this.reverseLightsMesh != null) {
                this.reverseLightsMesh.isVisible = (this.lastReverse > 0);
            }
            ///////////////////////////////////////////
            // Reset Skid Properties
            ///////////////////////////////////////////
            if (this.lastSKID_FL === 0 && this.lastSKID_FL === 0 && this.lastSKID_FL === 0 && this.lastSKID_FL === 0) {
                this.smokeIntensityFactor = 0;
            }
        }
        castWheelContactRays() {
            let raycast = null;
            this.frontLeftContact = false;
            this.frontRightContact = false;
            this.rearLeftContact = false;
            this.rearRightContact = false;
            this.frontLeftContactTag = "";
            this.frontRightContactTag = "";
            this.rearLeftContactTag = "";
            this.rearRightContactTag = "";
            this.frontLeftContactPoint.set(0, 0, 0);
            this.frontRightContactPoint.set(0, 0, 0);
            this.rearLeftContactPoint.set(0, 0, 0);
            this.rearRightContactPoint.set(0, 0, 0);
            this.frontLeftContactNormal.set(0, 0, 0);
            this.frontRightContactNormal.set(0, 0, 0);
            this.rearLeftContactNormal.set(0, 0, 0);
            this.rearRightContactNormal.set(0, 0, 0);
            // ..
            // Front Left Raycast Positions
            // ..
            UNITY.Utilities.GetAbsolutePositionToRef(this.frontLeftWheelMesh, this.startRaycastPosition);
            UNITY.Utilities.GetAbsolutePositionToRef(this.frontLeftWheelMesh, this.endRaycastPosition, this.downDirection.scale(this.downDistance));
            this.startRaycastPosition.addInPlace(this.m_velocityOffset);
            this.endRaycastPosition.addInPlace(this.m_velocityOffset);
            // Front Left Physics Raycast
            // FIXME: raycast = UNITY.RigidbodyPhysics.PhysicsRaycast(this.scene, this.startRaycastPosition, this.downDirection, this.downDistance);
            if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                this.frontLeftContact = true;
                this.frontLeftContactTag = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                this.frontLeftContactPoint.copyFrom(raycast.hitPoint);
                this.frontLeftContactNormal.copyFrom(raycast.hitNormal);
            }
            // Front Left Draw Debug Lines
            if (PROJECT.RemoteCarController.ShowSensorLines === true) {
                if (this.frontLeftSensorLine == null)
                    this.frontLeftSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".FrontLeftSensorLine", this.scene);
                if (this.frontLeftContact === true) {
                    this.frontLeftSensorLine.drawLine([this.startRaycastPosition, raycast.hitPoint], BABYLON.Color3.Yellow());
                }
                else {
                    this.frontLeftSensorLine.drawLine([this.startRaycastPosition, this.endRaycastPosition], BABYLON.Color3.Blue());
                }
            }
            // ..
            // Front Right Raycast Positions
            // ..
            UNITY.Utilities.GetAbsolutePositionToRef(this.frontRightWheelMesh, this.startRaycastPosition);
            UNITY.Utilities.GetAbsolutePositionToRef(this.frontRightWheelMesh, this.endRaycastPosition, this.downDirection.scale(this.downDistance));
            this.startRaycastPosition.addInPlace(this.m_velocityOffset);
            this.endRaycastPosition.addInPlace(this.m_velocityOffset);
            // Front Right Physics Raycast
            // FIXME: raycast = UNITY.RigidbodyPhysics.PhysicsRaycast(this.scene, this.startRaycastPosition, this.downDirection, this.downDistance);
            if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                this.frontRightContact = true;
                this.frontRightContactTag = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                this.frontRightContactPoint.copyFrom(raycast.hitPoint);
                this.frontRightContactNormal.copyFrom(raycast.hitNormal);
            }
            // Front Right Draw Debug Lines
            if (PROJECT.RemoteCarController.ShowSensorLines === true) {
                if (this.frontRightSensorLine == null)
                    this.frontRightSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".FrontRightSensorLine", this.scene);
                if (this.frontRightContact === true) {
                    this.frontRightSensorLine.drawLine([this.startRaycastPosition, raycast.hitPoint], BABYLON.Color3.Yellow());
                }
                else {
                    this.frontRightSensorLine.drawLine([this.startRaycastPosition, this.endRaycastPosition], BABYLON.Color3.Blue());
                }
            }
            // ..
            // Rear Left Raycast Positions
            // ..
            UNITY.Utilities.GetAbsolutePositionToRef(this.backLeftWheelMesh, this.startRaycastPosition);
            UNITY.Utilities.GetAbsolutePositionToRef(this.backLeftWheelMesh, this.endRaycastPosition, this.downDirection.scale(this.downDistance));
            this.startRaycastPosition.addInPlace(this.m_velocityOffset);
            this.endRaycastPosition.addInPlace(this.m_velocityOffset);
            // Rear Left Physics Raycast
            // FIXME: raycast = UNITY.RigidbodyPhysics.PhysicsRaycast(this.scene, this.startRaycastPosition, this.downDirection, this.downDistance);
            if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                this.rearLeftContact = true;
                this.rearLeftContactTag = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                this.rearLeftContactPoint.copyFrom(raycast.hitPoint);
                this.rearLeftContactNormal.copyFrom(raycast.hitNormal);
            }
            // Rear Left Draw Debug Lines
            if (PROJECT.RemoteCarController.ShowSensorLines === true) {
                if (this.rearLeftSensorLine == null)
                    this.rearLeftSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".RearLeftSensorLine", this.scene);
                if (this.rearLeftContact === true) {
                    this.rearLeftSensorLine.drawLine([this.startRaycastPosition, raycast.hitPoint], BABYLON.Color3.Yellow());
                }
                else {
                    this.rearLeftSensorLine.drawLine([this.startRaycastPosition, this.endRaycastPosition], BABYLON.Color3.Blue());
                }
            }
            // ..
            // Rear Right Raycast Positions
            // ..
            UNITY.Utilities.GetAbsolutePositionToRef(this.backRightWheelMesh, this.startRaycastPosition);
            UNITY.Utilities.GetAbsolutePositionToRef(this.backRightWheelMesh, this.endRaycastPosition, this.downDirection.scale(this.downDistance));
            this.startRaycastPosition.addInPlace(this.m_velocityOffset);
            this.endRaycastPosition.addInPlace(this.m_velocityOffset);
            // Rear Right Physics Raycast
            // FIXME: raycast = UNITY.RigidbodyPhysics.PhysicsRaycast(this.scene, this.startRaycastPosition, this.downDirection, this.downDistance);
            if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                this.rearRightContact = true;
                this.rearRightContactTag = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                this.rearRightContactPoint.copyFrom(raycast.hitPoint);
                this.rearRightContactNormal.copyFrom(raycast.hitNormal);
            }
            // Rear Right Draw Debug Lines
            if (PROJECT.RemoteCarController.ShowSensorLines === true) {
                if (this.rearRightSensorLine == null)
                    this.rearRightSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".RearRightSensorLine", this.scene);
                if (this.rearRightContact === true) {
                    this.rearRightSensorLine.drawLine([this.startRaycastPosition, raycast.hitPoint], BABYLON.Color3.Yellow());
                }
                else {
                    this.rearRightSensorLine.drawLine([this.startRaycastPosition, this.endRaycastPosition], BABYLON.Color3.Blue());
                }
            }
        }
        createSmokeParticleSystem(name, emitter) {
            const result = new BABYLON.ParticleSystem(name, 10000, this.scene);
            result.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
            result.particleTexture = this.smokeTexture;
            result.emitter = emitter;
            result.emitRate = 0;
            result.updateSpeed = 0.01;
            // change size and speed
            result.minSize = 0.2;
            result.maxSize = 1.3;
            result.minAngularSpeed = -1.5;
            result.maxAngularSpeed = 1.5;
            // changed lifetime to control shape of the cloud in conjunction with velocity gradient
            result.minLifeTime = 3.0;
            result.maxLifeTime = 5.0;
            // adding velocity over time to prevent large bloom of particles by launching them fast and then slowing them down GPU particles don't take a gradient on velocity, but the reduction in velocity over time is worth the trade off for less randomization
            result.addVelocityGradient(0, 1);
            result.addVelocityGradient(0.1, 0.7);
            result.addVelocityGradient(0.7, 0.2);
            result.addVelocityGradient(1.0, 0.05);
            // reduced the emit rate to reduce bloom of particles in the center of mass
            result.gravity = new BABYLON.Vector3(0, -0.1, 0);
            result.minEmitBox = new BABYLON.Vector3(0, -0.25, 0);
            result.maxEmitBox = new BABYLON.Vector3(0, -0.25, 0);
            result.direction1 = new BABYLON.Vector3(-1, -1, -1);
            result.direction2 = new BABYLON.Vector3(1, 1, 1);
            // The color1, color2, colorDead pattern is overridden by color gradient so is unnecessary
            result.color1 = new BABYLON.Color4(0.95, 0.95, 0.95, this.smokeOpacity);
            result.color2 = new BABYLON.Color4(0.85, 0.85, 0.85, this.smokeOpacity);
            result.colorDead = new BABYLON.Color4(0.9, 0.9, 0.9, (this.smokeOpacity * 0.5));
            // Changed the color gradient to add a second value for randomization and ramped the color down further to create more texture with alpha blending
            //result.addColorGradient(0.0, new BABYLON.Color4(1, 1, 1, 0.0), new BABYLON.Color4(0.7, 0.7, 0.7, 0.0));
            //result.addColorGradient(0.2, new BABYLON.Color4(0.7, 0.7, 0.7, 0.2), new BABYLON.Color4(0.6, 0.6, 0.6, 0.2));
            //result.addColorGradient(0.6, new BABYLON.Color4(0.6, 0.6, 0.6, 0.1),new BABYLON.Color4(0.4, 0.4, 0.4, 0.1));
            //result.addColorGradient(1.0, new BABYLON.Color4(0.3, 0.3, 0.3, 0.0),new BABYLON.Color4(0.1, 0.1, 0.1, 0.0));            
            return result;
        }
    }
    RemoteCarController.ShowSensorLines = false; // Note: Disable Debug Mode Sensors
    PROJECT.RemoteCarController = RemoteCarController;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
     * Babylon skidmark section class (Native Bullet Physics 2.82)
     * @class SkidMarkSection
     */
    class SkidMarkSection {
        constructor() {
            this.Pos = BABYLON.Vector3.Zero();
            this.Normal = BABYLON.Vector3.Zero();
            this.Tangent = BABYLON.Vector4.Zero();
            this.Posl = BABYLON.Vector3.Zero();
            this.Posr = BABYLON.Vector3.Zero();
            this.Intensity = 0.0;
            this.LastIndex = -1;
        }
    }
    PROJECT.SkidMarkSection = SkidMarkSection;
    /**
     * Babylon Script Component
     * @class SkidMarkManager
     */
    class SkidMarkManager extends UNITY.ScriptComponent {
        constructor(transform, scene, properties = {}) {
            super(transform, scene, properties);
            SkidMarkManager.MAX_MARKS = this.getProperty("maxSections", SkidMarkManager.MAX_MARKS);
            SkidMarkManager.MARK_COLOR = UNITY.Utilities.ParseColor3(this.getProperty("textureColor"), SkidMarkManager.MARK_COLOR);
            SkidMarkManager.MARK_WIDTH = this.getProperty("textureWidth", SkidMarkManager.MARK_WIDTH);
            SkidMarkManager.GROUND_OFFSET = this.getProperty("groundOffset", SkidMarkManager.GROUND_OFFSET);
            SkidMarkManager.GPU_TRIANGLES = this.getProperty("gpuQuadIndices", SkidMarkManager.GPU_TRIANGLES);
            SkidMarkManager.TEXTURE_MARKS = this.getProperty("textureMarks", SkidMarkManager.TEXTURE_MARKS);
            SkidMarkManager.TEX_INTENSITY = this.getProperty("textureIntensity", SkidMarkManager.TEX_INTENSITY);
            SkidMarkManager.MIN_DISTANCE = this.getProperty("textureDistance", SkidMarkManager.MIN_DISTANCE);
            SkidMarkManager.MIN_SQR_DISTANCE = (SkidMarkManager.MIN_DISTANCE * SkidMarkManager.MIN_DISTANCE);
        }
        start() { SkidMarkManager.CreateSkidMarkManager(this.scene); }
        update() { SkidMarkManager.UpdateSkidMarkManager(); }
        static AddSkidMarkSegment(pos, normal, intensity, lastIndex) {
            if (SkidMarkManager.SkidMarkMesh == null)
                return null;
            SkidMarkManager.TempVector3_POS.set(0, 0, 0);
            SkidMarkManager.TempVector3_DIR.set(0, 0, 0);
            SkidMarkManager.TempVector3_XDIR.set(0, 0, 0);
            SkidMarkManager.TempVector3_SDIR.set(0, 0, 0);
            // ..
            if (intensity > 1.0)
                intensity = 1.0;
            else if (intensity < 0.0)
                return -1.0;
            // ..
            if (lastIndex > 0) {
                pos.subtractToRef(SkidMarkManager.SkidMarkSections[lastIndex].Pos, SkidMarkManager.TempVector3_POS);
                const sqrDistance = SkidMarkManager.TempVector3_POS.lengthSquared();
                if (sqrDistance < SkidMarkManager.MIN_SQR_DISTANCE)
                    return lastIndex;
            }
            // ..
            const curSection = SkidMarkManager.SkidMarkSections[SkidMarkManager.SkidMarkIndex];
            normal.scaleToRef(SkidMarkManager.GROUND_OFFSET, SkidMarkManager.TempVector3_POS);
            pos.addToRef(SkidMarkManager.TempVector3_POS, curSection.Pos);
            curSection.Normal.copyFrom(normal);
            curSection.Intensity = (intensity * SkidMarkManager.TEX_INTENSITY);
            curSection.LastIndex = lastIndex;
            // ..
            if (lastIndex != -1) {
                const lastSection = SkidMarkManager.SkidMarkSections[lastIndex];
                curSection.Pos.subtractToRef(lastSection.Pos, SkidMarkManager.TempVector3_DIR);
                BABYLON.Vector3.CrossToRef(SkidMarkManager.TempVector3_DIR, normal, SkidMarkManager.TempVector3_XDIR);
                SkidMarkManager.TempVector3_XDIR.normalizeToRef(SkidMarkManager.TempVector3_XDIR);
                // ..
                SkidMarkManager.TempVector3_XDIR.scaleToRef(SkidMarkManager.MARK_WIDTH * 0.5, SkidMarkManager.TempVector3_SDIR);
                curSection.Pos.addToRef(SkidMarkManager.TempVector3_SDIR, curSection.Posl);
                curSection.Pos.subtractToRef(SkidMarkManager.TempVector3_SDIR, curSection.Posr);
                curSection.Tangent.set(SkidMarkManager.TempVector3_XDIR.x, SkidMarkManager.TempVector3_XDIR.y, SkidMarkManager.TempVector3_XDIR.z, 1);
                // ..
                if (lastSection.LastIndex === -1) {
                    curSection.Pos.addToRef(SkidMarkManager.TempVector3_SDIR, lastSection.Posl);
                    curSection.Pos.subtractToRef(SkidMarkManager.TempVector3_SDIR, lastSection.Posr);
                    lastSection.Tangent.copyFrom(curSection.Tangent);
                }
            }
            // ..
            SkidMarkManager.AddSkidMarkVertexData();
            const curIndex = SkidMarkManager.SkidMarkIndex;
            SkidMarkManager.SkidMarkIndex = ++SkidMarkManager.SkidMarkIndex % SkidMarkManager.MAX_MARKS;
            return curIndex;
        }
        static CreateSkidMarkManager(scene) {
            if (SkidMarkManager.SkidMarkMesh == null) {
                const skidmarkMaterial = new BABYLON.StandardMaterial("SkidMarkMaterial", scene);
                skidmarkMaterial.backFaceCulling = false;
                skidmarkMaterial.disableLighting = true;
                skidmarkMaterial.emissiveColor = SkidMarkManager.MARK_COLOR;
                skidmarkMaterial.diffuseColor = SkidMarkManager.MARK_COLOR;
                skidmarkMaterial.diffuseTexture = UNITY.Utilities.ParseTexture(SkidMarkManager.TEXTURE_MARKS, scene);
                if (skidmarkMaterial.diffuseTexture != null) {
                    skidmarkMaterial.diffuseTexture.hasAlpha = true;
                    skidmarkMaterial.useAlphaFromDiffuseTexture = true;
                }
                skidmarkMaterial.freeze();
                SkidMarkManager.SkidMarkMesh = new BABYLON.Mesh("SkidMarkMesh", scene);
                SkidMarkManager.SkidMarkMesh.material = skidmarkMaterial;
                SkidMarkManager.SkidMarkMesh.renderingGroupId = UNITY.Utilities.DefaultRenderGroup();
                SkidMarkManager.SkidMarkMesh.alwaysSelectAsActiveMesh = true;
                SkidMarkManager.SkidMarkMesh.doNotSyncBoundingInfo = true;
                SkidMarkManager.SkidMarkMesh.receiveShadows = false;
                SkidMarkManager.SkidMarkMesh.checkCollisions = false;
                SkidMarkManager.SkidMarkMesh.useVertexColors = true;
                SkidMarkManager.SkidMarkMesh.hasVertexAlpha = true;
                SkidMarkManager.SkidMarkMesh.isPickable = false;
                // ..
                // Setup SkidMark Section Properties
                // ..
                SkidMarkManager.SkidMarkSections = new Array(SkidMarkManager.MAX_MARKS);
                for (let i = 0; i < SkidMarkManager.SkidMarkSections.length; i++) {
                    SkidMarkManager.SkidMarkSections[i] = new SkidMarkSection();
                }
                // ..
                // Setup Raw Mesh Vertex Buffer Data
                // ..
                SkidMarkManager.SkidBufferPositions = new Float32Array(SkidMarkManager.MAX_MARKS * 4 * 3);
                SkidMarkManager.SkidBufferNormals = new Float32Array(SkidMarkManager.MAX_MARKS * 4 * 3);
                SkidMarkManager.SkidBufferTangents = new Float32Array(SkidMarkManager.MAX_MARKS * 4 * 4);
                SkidMarkManager.SkidBufferColors = new Float32Array(SkidMarkManager.MAX_MARKS * 4 * 4);
                SkidMarkManager.SkidBufferUvs = new Float32Array(SkidMarkManager.MAX_MARKS * 4 * 2);
                SkidMarkManager.SkidBufferIndices = new Int32Array(SkidMarkManager.MAX_MARKS * 6);
                // ..
                // Apply Raw Vertex Buffer Data To Mesh
                // ..
                const vertexData = new BABYLON.VertexData();
                vertexData.positions = SkidMarkManager.SkidBufferPositions;
                vertexData.normals = SkidMarkManager.SkidBufferNormals;
                vertexData.tangents = SkidMarkManager.SkidBufferTangents;
                vertexData.colors = SkidMarkManager.SkidBufferColors;
                vertexData.uvs = SkidMarkManager.SkidBufferUvs;
                vertexData.indices = SkidMarkManager.SkidBufferIndices;
                vertexData.applyToMesh(SkidMarkManager.SkidMarkMesh, true);
                SkidMarkManager.SkidMarkMesh.freezeWorldMatrix();
            }
        }
        static AddSkidMarkVertexData() {
            const curr = SkidMarkManager.SkidMarkSections[SkidMarkManager.SkidMarkIndex];
            if (curr.LastIndex === -1)
                return;
            const last = SkidMarkManager.SkidMarkSections[curr.LastIndex];
            SkidMarkManager.SkidMarkUpdated = true;
            // ..
            // Update Position Buffers Directly
            // ..
            let index = SkidMarkManager.SkidMarkIndex * 4 + 0;
            SkidMarkManager.SkidBufferPositions[index * 3] = last.Posl.x;
            SkidMarkManager.SkidBufferPositions[(index * 3) + 1] = last.Posl.y;
            SkidMarkManager.SkidBufferPositions[(index * 3) + 2] = last.Posl.z;
            index = SkidMarkManager.SkidMarkIndex * 4 + 1;
            SkidMarkManager.SkidBufferPositions[index * 3] = last.Posr.x;
            SkidMarkManager.SkidBufferPositions[(index * 3) + 1] = last.Posr.y;
            SkidMarkManager.SkidBufferPositions[(index * 3) + 2] = last.Posr.z;
            index = SkidMarkManager.SkidMarkIndex * 4 + 2;
            SkidMarkManager.SkidBufferPositions[index * 3] = curr.Posl.x;
            SkidMarkManager.SkidBufferPositions[(index * 3) + 1] = curr.Posl.y;
            SkidMarkManager.SkidBufferPositions[(index * 3) + 2] = curr.Posl.z;
            index = SkidMarkManager.SkidMarkIndex * 4 + 3;
            SkidMarkManager.SkidBufferPositions[index * 3] = curr.Posr.x;
            SkidMarkManager.SkidBufferPositions[(index * 3) + 1] = curr.Posr.y;
            SkidMarkManager.SkidBufferPositions[(index * 3) + 2] = curr.Posr.z;
            // ..
            // Update Normal Buffers Directly
            // ..
            index = SkidMarkManager.SkidMarkIndex * 4 + 0;
            SkidMarkManager.SkidBufferNormals[index * 3] = last.Normal.x;
            SkidMarkManager.SkidBufferNormals[(index * 3) + 1] = last.Normal.y;
            SkidMarkManager.SkidBufferNormals[(index * 3) + 2] = last.Normal.z;
            index = SkidMarkManager.SkidMarkIndex * 4 + 1;
            SkidMarkManager.SkidBufferNormals[index * 3] = last.Normal.x;
            SkidMarkManager.SkidBufferNormals[(index * 3) + 1] = last.Normal.y;
            SkidMarkManager.SkidBufferNormals[(index * 3) + 2] = last.Normal.z;
            index = SkidMarkManager.SkidMarkIndex * 4 + 2;
            SkidMarkManager.SkidBufferNormals[index * 3] = curr.Normal.x;
            SkidMarkManager.SkidBufferNormals[(index * 3) + 1] = curr.Normal.y;
            SkidMarkManager.SkidBufferNormals[(index * 3) + 2] = curr.Normal.z;
            index = SkidMarkManager.SkidMarkIndex * 4 + 3;
            SkidMarkManager.SkidBufferNormals[index * 3] = curr.Normal.x;
            SkidMarkManager.SkidBufferNormals[(index * 3) + 1] = curr.Normal.y;
            SkidMarkManager.SkidBufferNormals[(index * 3) + 2] = curr.Normal.z;
            // ..
            // Update Tangent Buffers Directly
            // ..
            index = SkidMarkManager.SkidMarkIndex * 4 + 0;
            SkidMarkManager.SkidBufferTangents[index * 4] = last.Tangent.x;
            SkidMarkManager.SkidBufferTangents[(index * 4) + 1] = last.Tangent.y;
            SkidMarkManager.SkidBufferTangents[(index * 4) + 2] = last.Tangent.z;
            SkidMarkManager.SkidBufferTangents[(index * 4) + 3] = last.Tangent.w;
            index = SkidMarkManager.SkidMarkIndex * 4 + 1;
            SkidMarkManager.SkidBufferTangents[index * 4] = last.Tangent.x;
            SkidMarkManager.SkidBufferTangents[(index * 4) + 1] = last.Tangent.y;
            SkidMarkManager.SkidBufferTangents[(index * 4) + 2] = last.Tangent.z;
            SkidMarkManager.SkidBufferTangents[(index * 4) + 3] = last.Tangent.w;
            index = SkidMarkManager.SkidMarkIndex * 4 + 2;
            SkidMarkManager.SkidBufferTangents[index * 4] = curr.Tangent.x;
            SkidMarkManager.SkidBufferTangents[(index * 4) + 1] = curr.Tangent.y;
            SkidMarkManager.SkidBufferTangents[(index * 4) + 2] = curr.Tangent.z;
            SkidMarkManager.SkidBufferTangents[(index * 4) + 3] = curr.Tangent.w;
            index = SkidMarkManager.SkidMarkIndex * 4 + 3;
            SkidMarkManager.SkidBufferTangents[index * 4] = curr.Tangent.x;
            SkidMarkManager.SkidBufferTangents[(index * 4) + 1] = curr.Tangent.y;
            SkidMarkManager.SkidBufferTangents[(index * 4) + 2] = curr.Tangent.z;
            SkidMarkManager.SkidBufferTangents[(index * 4) + 3] = curr.Tangent.w;
            // ..
            // Update Color Buffers Directly
            // ..
            index = SkidMarkManager.SkidMarkIndex * 4 + 0;
            SkidMarkManager.SkidBufferColors[index * 4] = 1.0;
            SkidMarkManager.SkidBufferColors[(index * 4) + 1] = 1.0;
            SkidMarkManager.SkidBufferColors[(index * 4) + 2] = 1.0;
            SkidMarkManager.SkidBufferColors[(index * 4) + 3] = last.Intensity;
            index = SkidMarkManager.SkidMarkIndex * 4 + 1;
            SkidMarkManager.SkidBufferColors[index * 4] = 1.0;
            SkidMarkManager.SkidBufferColors[(index * 4) + 1] = 1.0;
            SkidMarkManager.SkidBufferColors[(index * 4) + 2] = 1.0;
            SkidMarkManager.SkidBufferColors[(index * 4) + 3] = last.Intensity;
            index = SkidMarkManager.SkidMarkIndex * 4 + 2;
            SkidMarkManager.SkidBufferColors[index * 4] = 1.0;
            SkidMarkManager.SkidBufferColors[(index * 4) + 1] = 1.0;
            SkidMarkManager.SkidBufferColors[(index * 4) + 2] = 1.0;
            SkidMarkManager.SkidBufferColors[(index * 4) + 3] = curr.Intensity;
            index = SkidMarkManager.SkidMarkIndex * 4 + 3;
            SkidMarkManager.SkidBufferColors[index * 4] = 1.0;
            SkidMarkManager.SkidBufferColors[(index * 4) + 1] = 1.0;
            SkidMarkManager.SkidBufferColors[(index * 4) + 2] = 1.0;
            SkidMarkManager.SkidBufferColors[(index * 4) + 3] = curr.Intensity;
            // ..
            // Update Coord Buffers Directly
            // ..
            index = SkidMarkManager.SkidMarkIndex * 4 + 0;
            SkidMarkManager.SkidBufferUvs[index * 2] = 0;
            SkidMarkManager.SkidBufferUvs[(index * 2) + 1] = 0;
            index = SkidMarkManager.SkidMarkIndex * 4 + 1;
            SkidMarkManager.SkidBufferUvs[index * 2] = 1;
            SkidMarkManager.SkidBufferUvs[(index * 2) + 1] = 0;
            index = SkidMarkManager.SkidMarkIndex * 4 + 2;
            SkidMarkManager.SkidBufferUvs[index * 2] = 0;
            SkidMarkManager.SkidBufferUvs[(index * 2) + 1] = 1;
            index = SkidMarkManager.SkidMarkIndex * 4 + 3;
            SkidMarkManager.SkidBufferUvs[index * 2] = 1;
            SkidMarkManager.SkidBufferUvs[(index * 2) + 1] = 1;
            // ..
            // Update Triangle 1 Buffers Directly (QUAD)
            //..
            SkidMarkManager.SkidBufferIndices[SkidMarkManager.SkidMarkIndex * 6 + 0] = SkidMarkManager.SkidMarkIndex * 4 + 0;
            SkidMarkManager.SkidBufferIndices[SkidMarkManager.SkidMarkIndex * 6 + 2] = SkidMarkManager.SkidMarkIndex * 4 + 1;
            SkidMarkManager.SkidBufferIndices[SkidMarkManager.SkidMarkIndex * 6 + 1] = SkidMarkManager.SkidMarkIndex * 4 + 2;
            // ..
            // Update Triangle 2 Buffers Directly (QUAD)
            // ..
            SkidMarkManager.SkidBufferIndices[SkidMarkManager.SkidMarkIndex * 6 + 3] = SkidMarkManager.SkidMarkIndex * 4 + 2;
            SkidMarkManager.SkidBufferIndices[SkidMarkManager.SkidMarkIndex * 6 + 5] = SkidMarkManager.SkidMarkIndex * 4 + 1;
            SkidMarkManager.SkidBufferIndices[SkidMarkManager.SkidMarkIndex * 6 + 4] = SkidMarkManager.SkidMarkIndex * 4 + 3;
        }
        static UpdateSkidMarkManager() {
            if (SkidMarkManager.SkidMarkMesh != null && SkidMarkManager.SkidMarkUpdated === true) {
                SkidMarkManager.SkidMarkUpdated = false;
                if (SkidMarkManager.SkidMarkMesh.geometry != null) {
                    SkidMarkManager.SkidMarkMesh.geometry.updateVerticesDataDirectly(BABYLON.VertexBuffer.PositionKind, SkidMarkManager.SkidBufferPositions, 0, false);
                    SkidMarkManager.SkidMarkMesh.geometry.updateVerticesDataDirectly(BABYLON.VertexBuffer.NormalKind, SkidMarkManager.SkidBufferNormals, 0, false);
                    SkidMarkManager.SkidMarkMesh.geometry.updateVerticesDataDirectly(BABYLON.VertexBuffer.TangentKind, SkidMarkManager.SkidBufferTangents, 0, false);
                    SkidMarkManager.SkidMarkMesh.geometry.updateVerticesDataDirectly(BABYLON.VertexBuffer.ColorKind, SkidMarkManager.SkidBufferColors, 0, false);
                    SkidMarkManager.SkidMarkMesh.geometry.updateVerticesDataDirectly(BABYLON.VertexBuffer.UVKind, SkidMarkManager.SkidBufferUvs, 0, false);
                    SkidMarkManager.SkidMarkMesh.geometry.updateIndices(SkidMarkManager.SkidBufferIndices, 0, SkidMarkManager.GPU_TRIANGLES);
                }
            }
        }
    }
    SkidMarkManager.MAX_MARKS = 1024; // Max number of marks total for everyone together
    SkidMarkManager.GROUND_OFFSET = 0.01; // Distance above surface in metres
    SkidMarkManager.GPU_TRIANGLES = true; // GPU quad triangle indices only
    SkidMarkManager.MARK_COLOR = BABYLON.Color3.Black(); // SkidMark Color
    SkidMarkManager.MARK_WIDTH = 0.3; // Width of the SkidMarks. Should match the width of the wheels
    SkidMarkManager.TEX_INTENSITY = 1.0; // Amount of the skidmark texture intensity coeffecient
    SkidMarkManager.MIN_DISTANCE = 0.1; // Distance between skid texture sections in metres. Bigger = better performance, less smooth
    SkidMarkManager.MIN_SQR_DISTANCE = (SkidMarkManager.MIN_DISTANCE * SkidMarkManager.MIN_DISTANCE);
    SkidMarkManager.TEXTURE_MARKS = null;
    SkidMarkManager.SkidBufferPositions = null;
    SkidMarkManager.SkidBufferNormals = null;
    SkidMarkManager.SkidBufferTangents = null;
    SkidMarkManager.SkidBufferColors = null;
    SkidMarkManager.SkidBufferUvs = null;
    SkidMarkManager.SkidBufferIndices = null;
    SkidMarkManager.SkidMarkSections = null;
    SkidMarkManager.SkidMarkIndex = 0;
    SkidMarkManager.SkidMarkMesh = null;
    SkidMarkManager.SkidMarkUpdated = false;
    SkidMarkManager.TempVector3_POS = new BABYLON.Vector3(0, 0, 0);
    SkidMarkManager.TempVector3_DIR = new BABYLON.Vector3(0, 0, 0);
    SkidMarkManager.TempVector3_XDIR = new BABYLON.Vector3(0, 0, 0);
    SkidMarkManager.TempVector3_SDIR = new BABYLON.Vector3(0, 0, 0);
    PROJECT.SkidMarkManager = SkidMarkManager;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
     * Babylon standard rigidbody vehicle controller class (Native Bullet Physics 2.82)
     * @class StandardCarController
     */
    class StandardCarController extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.MIN_RPM = 1000;
            this.MAX_RPM = 6000;
            this._animator = null;
            this._rigidbody = null;
            this._engineAudioSource = null;
            this._skidAudioSource = null;
            this.steeringWheelHub = null;
            this.steeringWheelAxis = 2;
            this.maxSteeringAngle = 65.0;
            this.maxSteeringSpeed = 15.0;
            this.gearIndex = 0; // First Gear Ratio
            this.downShift = 1000;
            this.skiddingTime = 0;
            this.shiftingTime = 0;
            this.shiftingBrake = 1.0;
            this.engineForce = 0;
            this.handBraking = false;
            this.linearDamping = 0;
            this.angularDamping = 0;
            this.forwardSpeed = 0;
            this.absoluteSpeed = 0;
            this.americanSpeed = 0;
            this.gradientSpeed = 0;
            this.frontWheelPower = 0;
            this.backWheelPower = 0;
            this.wheelBrakingForce = 0;
            this.enginePitchLevel = 0;
            this.smokeIntensityFactor = 0;
            this.raycastVehicle = null;
            this.brakeLightsMesh = null;
            this.brakeLightsTrans = null;
            this.reverseLightsMesh = null;
            this.reverseLightsTrans = null;
            this.frontLeftWheelTrans = null;
            this.frontRightWheelTrans = null;
            this.backLeftWheelTrans = null;
            this.backRightWheelTrans = null;
            this.frontLeftWheelMesh = null;
            this.frontRightWheelMesh = null;
            this.backLeftWheelMesh = null;
            this.backRightWheelMesh = null;
            this.frontLeftWheelEmitter = null;
            this.frontRightWheelEmitter = null;
            this.backLeftWheelEmitter = null;
            this.backRightWheelEmitter = null;
            this.frontLeftWheelParticle = null;
            this.frontRightWheelParticle = null;
            this.backLeftWheelParticle = null;
            this.backRightWheelParticle = null;
            this.frontLeftWheelCollider = null;
            this.frontRightWheelCollider = null;
            this.backLeftWheelCollider = null;
            this.backRightWheelCollider = null;
            this.engineTorqueCurve = null;
            this.physicsSteerAngleL = 0;
            this.physicsSteerAngleR = 0;
            this.visualSteerAngleL = 0;
            this.visualSteerAngleR = 0;
            this.visualSteerBoostL = 0;
            this.visualSteerBoostR = 0;
            this.wheelRadius = 0;
            this.clutchSlip = 0;
            this.engineRPM = 0;
            this.pitchRPM = 0;
            this.shiftRPM = 0;
            this.SKID_FL = 0;
            this.SKID_FR = 0;
            this.SKID_RL = 0;
            this.SKID_RR = 0;
            this.PITCH_FL = 0;
            this.PITCH_FR = 0;
            this.PITCH_RL = 0;
            this.PITCH_RR = 0;
            this.FRONT_LEFT = -1;
            this.FRONT_RIGHT = -1;
            this.BACK_LEFT = -1;
            this.BACK_RIGHT = -1;
            this.WHEEL_SKID_PITCH = 0;
            this.SPIN_FL_Rotation = new BABYLON.Vector3(0, 0, 0);
            this.SPIN_FR_Rotation = new BABYLON.Vector3(0, 0, 0);
            this.SPIN_RL_Rotation = new BABYLON.Vector3(0, 0, 0);
            this.SPIN_RR_Rotation = new BABYLON.Vector3(0, 0, 0);
            this.smokeTexture = null;
            this.skidThreashold = 0.65;
            this.wheelDrawVelocity = 0.02;
            this.smokeIntensity = 150;
            this.smokeOpacity = 0.1;
            this.smokeDonuts = 2.0;
            this.maxBurnoutFactor = 1.0;
            this.maxSteerBoost = 6;
            this.overSteerSpeed = 1.0;
            this.overSteerTimeout = 0.2;
            this.topEngineSpeed = 125;
            this.powerCoefficient = 1.0;
            this.frictionLerpSpeed = 0.5;
            this.topSpeedDampener = 0.15;
            this.lowSpeedSteering = 5.0;
            this.highSpeedSteering = 5.0;
            // DEPRECIATED: public rayTestingType:number = 0;
            // DEPRECIATED: public testPointCount:number = 32;
            // DEPRECIATED: public sweepPenetration:number = 0.0;
            this.stableGravityFactor = 4;
            this.smoothFlyingForce = 250;
            this.transmissionRatio = 0.75;
            this.differentialRatio = 3.55;
            this.maxFrontBraking = 0.0;
            this.maxReversePower = 0.5;
            this.minBrakingForce = 50;
            this.maxBrakingForce = 250;
            this.handBrakingForce = 2500;
            this.handBrakingTimer = 0;
            this.linearBrakingForce = 25.0;
            this.angularBrakingForce = 0.25;
            this.burnoutFrictionSlip = 1.0;
            this.burnoutTimeDelay = 1;
            this.burnoutWheelPitch = 0.85;
            this.burnoutCoefficient = 10;
            this.burnoutTriggerMark = 10;
            this.enableBurnouts = false;
            this.penaltyGroundTag = "Offroad";
            this.minPenaltySpeed = 65;
            this.linearWheelDrag = 0.05;
            this.frictionWheelSlip = 0.215;
            this.showSensorLines = false;
            this.linkTrackManager = true;
            this.playVehicleSounds = true;
            this.postNetworkAttributes = false;
            this.wheelDriveType = 0;
            this.gearBoxMultiplier = 1.0;
            this.gearBoxMaxPitching = 6500;
            this.gearBoxShiftChange = 5100;
            this.gearBoxShiftDelay = 0.35;
            this.gearBoxShiftRatios = [4.17, 2.34, 1.82, 1.54, 0.96, 0.68];
            this.gearBoxShiftRanges = [1000, 2400, 2600, 2600, 2800, 2800];
            this.throttleBrakingForce = 0;
            this.throttleEngineSpeed = 0;
            this.brakeRecoveryDelay = 0.25;
            this.brakeRecoverySpeed = 0.25;
            this.skidRecoverySpeed = 0.25;
            this.burnoutLerpSpeed = 0.05;
            this.ackermanWheelBase = 2.5;
            this.ackermanRearTrack = 1.5;
            this.ackermanTurnRadius = 15;
            this.ackermanTurnFactor = 1;
            this.m_frontLeftWheel = null;
            this.m_frontRightWheel = null;
            this.m_backLeftWheel = null;
            this.m_backRightWheel = null;
            this.m_frontLeftWheelSkid = -1;
            this.m_frontRightWheelSkid = -1;
            this.m_backLeftWheelSkid = -1;
            this.m_backRightWheelSkid = -1;
            this.m_angularDampener = new BABYLON.Vector3(1.0, 1.0, 1.0);
            this.m_velocityOffset = new BABYLON.Vector3(0, 0, 0);
            this.m_linearVelocity = new BABYLON.Vector3(0, 0, 0);
            this.m_lastPosition = new BABYLON.Vector3(0, 0, 0);
            this.m_scaledVelocity = 0;
            ////////////////////////////////////////////////////
            // Public Vehicle Controller Movement Functions   //
            ////////////////////////////////////////////////////
            this.burnoutTimer = 0;
            this.restoreTimer = 0;
            this.cooldownTimer = 0;
            this.wheelDonuts = false;
            this.wheelBurnout = false;
            this.wheelSkidding = false;
            this.donutSpinTime = 0;
            this.currentForward = 0;
            this.currentTurning = 0;
            this.currentSkidding = false;
            this.currentDonuts = false;
            this.animatorSteerAngle = 0;
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Wheel Contact Raycast System
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            this.frontLeftContact = false;
            this.frontRightContact = false;
            this.rearLeftContact = false;
            this.rearRightContact = false;
            this.frontLeftContactTag = "";
            this.frontRightContactTag = "";
            this.rearLeftContactTag = "";
            this.rearRightContactTag = "";
            this.frontLeftContactPoint = new BABYLON.Vector3(0, 0, 0);
            this.frontRightContactPoint = new BABYLON.Vector3(0, 0, 0);
            this.rearLeftContactPoint = new BABYLON.Vector3(0, 0, 0);
            this.rearRightContactPoint = new BABYLON.Vector3(0, 0, 0);
            this.frontLeftContactNormal = new BABYLON.Vector3(0, 0, 0);
            this.frontRightContactNormal = new BABYLON.Vector3(0, 0, 0);
            this.rearLeftContactNormal = new BABYLON.Vector3(0, 0, 0);
            this.rearRightContactNormal = new BABYLON.Vector3(0, 0, 0);
            this.frontLeftSensorLine = null;
            this.frontRightSensorLine = null;
            this.rearLeftSensorLine = null;
            this.rearRightSensorLine = null;
            this.frontLeftFrictionLerping = false;
            this.frontRightFrictionLerping = false;
            this.rearLeftFrictionLerping = false;
            this.rearRightFrictionLerping = false;
            this.frontLeftFrictionPenalty = false;
            this.frontRightFrictionPenalty = false;
            this.rearLeftFrictionPenalty = false;
            this.rearRightFrictionPenalty = false;
            this.startRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            this.endRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            this.downDirection = new BABYLON.Vector3(0, -1, 0);
            this.downDistance = 2.0;
        }
        getFootBraking() { return (this.currentForward < 0 && this.forwardSpeed >= 0); }
        getHandBraking() { return this.handBraking; }
        getLinearVelocity() { return this.m_linearVelocity; }
        getCurrentForward() { return this.currentForward; }
        getCurrentTurning() { return this.currentTurning; }
        getCurrentSkidding() { return this.currentSkidding; }
        getCurrentDonuts() { return this.currentDonuts; }
        getReverseThrottle() { return (this.currentForward < 0 && this.forwardSpeed < 0); }
        getEnginePitchLevel() { return this.enginePitchLevel; }
        // DEPRECIATED: public getFrontLeftSpin():BABYLON.Quaternion { return (this.m_frontLeftWheel != null && this.m_frontLeftWheel.spinner != null && this.m_frontLeftWheel.spinner.rotationQuaternion != null) ? this.m_frontLeftWheel.spinner.rotationQuaternion : null; }
        // DEPRECIATED: public getFrontRightSpin():BABYLON.Quaternion { return (this.m_frontRightWheel != null && this.m_frontRightWheel.spinner != null && this.m_frontRightWheel.spinner.rotationQuaternion != null) ? this.m_frontRightWheel.spinner.rotationQuaternion : null; }
        // DEPRECIATED: public getBackLeftSpin():BABYLON.Quaternion { return (this.m_backLeftWheel != null && this.m_backLeftWheel.spinner != null && this.m_backLeftWheel.spinner.rotationQuaternion != null) ? this.m_backLeftWheel.spinner.rotationQuaternion : null; }
        // DEPRECIATED: public getBackRightSpin():BABYLON.Quaternion { return (this.m_backRightWheel != null && this.m_backRightWheel.spinner != null && this.m_backRightWheel.spinner.rotationQuaternion != null) ? this.m_backRightWheel.spinner.rotationQuaternion : null; }
        getCurrentBurnout() { return this.wheelBurnout || this.restoreTimer > 0; }
        getFrontLeftSkid() { return this.SKID_FL; }
        getFrontRightSkid() { return this.SKID_FR; }
        getBackLeftSkid() { return this.SKID_RL; }
        getBackRightSkid() { return this.SKID_RR; }
        getWheelSkidPitch() { return this.WHEEL_SKID_PITCH; }
        getRigidbodyPhysics() { return this._rigidbody; }
        getRaycastVehicle() { return this.raycastVehicle; }
        getGradientSpeed() { return this.gradientSpeed; }
        getForwardSpeed() { return this.forwardSpeed; }
        getAbsoluteSpeed() { return this.absoluteSpeed; }
        getAmericanSpeed() { return this.americanSpeed; }
        getNormalizedSpeed() { return this.americanSpeed / this.topEngineSpeed; }
        getTopEngineSpeed() { return this.topEngineSpeed; }
        getMaxReversePower() { return this.maxReversePower; }
        getCurrentGearIndex() { return this.gearIndex; }
        getCurrentEngineRPM() { return this.engineRPM; }
        getCurrentEngineForce() { return this.engineForce; }
        getCurrentEnginePitch() { return BABYLON.Scalar.Clamp((this.pitchRPM / this.gearBoxMaxPitching) + 0.1); }
        getGearShiftRatioCount() { return (this.gearBoxShiftRatios != null) ? this.gearBoxShiftRatios.length : 0; }
        getSmokeTextureMask() { return this.smokeTexture; }
        getBrakeLightsMesh() { return this.brakeLightsMesh; }
        getReverseLightsMesh() { return this.reverseLightsMesh; }
        getFrontLeftWheelNode() { return this.frontLeftWheelMesh; }
        getFrontRightWheelNode() { return this.frontRightWheelMesh; }
        getBackLeftWheelNode() { return this.backLeftWheelMesh; }
        getBackRightWheelNode() { return this.backRightWheelMesh; }
        getWheelBurnoutEnabled() { return this.wheelBurnout; }
        getWheelDonutsEnabled() { return this.wheelDonuts; }
        getCurrentDonutSpinTime() { return this.donutSpinTime; }
        getSmokeIntensityFactor() { return this.smokeIntensityFactor; }
        getWheelVelocityOffset() { return this.m_velocityOffset; }
        awake() { this.awakeVehicleState(); }
        start() { this.initVehicleState(); }
        update() { this.updateVehicleState(); }
        destroy() { this.destroyVehicleState(); }
        //////////////////////////////////////////////////
        // Protected Vehicle Movement State Functions //
        //////////////////////////////////////////////////
        awakeVehicleState() {
            this.engineForce = 0;
            this.frontWheelPower = 0;
            this.backWheelPower = 0;
            this.wheelBrakingForce = 0;
            // DEPRECIATED: this.rayTestingType = this.getProperty("rayTestingType", this.rayTestingType);
            // DEPRECIATED: this.testPointCount = this.getProperty("testPointCount", this.testPointCount);
            // DEPRECIATED: this.sweepPenetration = this.getProperty("sweepPenetration", this.sweepPenetration);
            this.ackermanWheelBase = this.getProperty("ackermanWheelBase", this.ackermanWheelBase);
            this.ackermanRearTrack = this.getProperty("ackermanRearTrack", this.ackermanRearTrack);
            this.ackermanTurnRadius = this.getProperty("ackermanTurnRadius", this.ackermanTurnRadius);
            this.wheelDrawVelocity = this.getProperty("wheelDrawVelocity", this.wheelDrawVelocity);
            this.skidThreashold = this.getProperty("skidThreashold", this.skidThreashold);
            this.smokeIntensity = this.getProperty("smokeIntensity", this.smokeIntensity);
            this.smokeOpacity = this.getProperty("smokeOpacity", this.smokeOpacity);
            this.smokeDonuts = this.getProperty("smokeDonuts", this.smokeDonuts);
            this.topEngineSpeed = this.getProperty("topEngineSpeed", this.topEngineSpeed);
            this.powerCoefficient = this.getProperty("powerCoefficient", this.powerCoefficient);
            this.maxFrontBraking = this.getProperty("maxFrontBraking", this.maxFrontBraking);
            this.maxReversePower = this.getProperty("maxReversePower", this.maxReversePower);
            this.penaltyGroundTag = this.getProperty("penaltyGroundTag", this.penaltyGroundTag);
            this.minPenaltySpeed = this.getProperty("minPenaltySpeed", this.minPenaltySpeed);
            this.linearWheelDrag = this.getProperty("linearWheelDrag", this.linearWheelDrag);
            this.frictionWheelSlip = this.getProperty("frictionWheelSlip", this.frictionWheelSlip);
            this.showSensorLines = this.getProperty("showSensorLines", this.showSensorLines);
            this.stableGravityFactor = this.getProperty("stableGravityFactor", this.stableGravityFactor);
            this.smoothFlyingForce = this.getProperty("smoothFlyingForce", this.smoothFlyingForce);
            this.frictionLerpSpeed = this.getProperty("frictionLerpSpeed", this.frictionLerpSpeed);
            this.maxBurnoutFactor = this.getProperty("maxBurnoutFactor", this.maxBurnoutFactor);
            this.maxSteerBoost = this.getProperty("maxSteerBoost", this.maxSteerBoost);
            this.overSteerSpeed = this.getProperty("overSteerSpeed", this.overSteerSpeed);
            this.overSteerTimeout = this.getProperty("overSteerTimeout", this.overSteerTimeout);
            this.wheelDriveType = this.getProperty("wheelDriveType", this.wheelDriveType);
            this.minBrakingForce = this.getProperty("minBrakingForce", this.minBrakingForce);
            this.maxBrakingForce = this.getProperty("maxBrakingForce", this.maxBrakingForce);
            this.handBrakingForce = this.getProperty("handBrakingForce", this.handBrakingForce);
            this.brakeRecoveryDelay = this.getProperty("brakeRecoveryDelay", this.brakeRecoveryDelay);
            this.brakeRecoverySpeed = this.getProperty("brakeRecoverySpeed", this.brakeRecoverySpeed);
            this.skidRecoverySpeed = this.getProperty("skidRecoverySpeed", this.skidRecoverySpeed);
            this.linearBrakingForce = this.getProperty("linearBrakingForce", this.linearBrakingForce);
            this.angularBrakingForce = this.getProperty("angularBrakingForce", this.angularBrakingForce);
            this.steeringWheelAxis = this.getProperty("steeringWheelAxis", this.steeringWheelAxis);
            this.maxSteeringAngle = this.getProperty("maxSteeringAngle", this.maxSteeringAngle);
            this.maxSteeringSpeed = this.getProperty("maxSteeringSpeed", this.maxSteeringSpeed);
            this.topSpeedDampener = this.getProperty("topSpeedDampener", this.topSpeedDampener);
            this.lowSpeedSteering = this.getProperty("lowSpeedSteering", this.lowSpeedSteering);
            this.highSpeedSteering = this.getProperty("highSpeedSteering", this.highSpeedSteering);
            this.brakeLightsTrans = this.getProperty("brakeLightsMesh", this.brakeLightsTrans);
            this.reverseLightsTrans = this.getProperty("reverseLightsMesh", this.reverseLightsTrans);
            this.frontLeftWheelTrans = this.getProperty("frontLeftWheelMesh", this.frontLeftWheelTrans);
            this.frontRightWheelTrans = this.getProperty("frontRightWheelMesh", this.frontRightWheelTrans);
            this.backLeftWheelTrans = this.getProperty("rearLeftWheelMesh", this.backLeftWheelTrans);
            this.backRightWheelTrans = this.getProperty("rearRightWheelMesh", this.backRightWheelTrans);
            this.frontLeftWheelCollider = this.getProperty("frontLeftWheelCollider", this.frontLeftWheelCollider);
            this.frontRightWheelCollider = this.getProperty("frontRightWheelCollider", this.frontRightWheelCollider);
            this.backLeftWheelCollider = this.getProperty("rearLeftWheelCollider", this.backLeftWheelCollider);
            this.backRightWheelCollider = this.getProperty("rearRightWheelCollider", this.backRightWheelCollider);
            this.burnoutFrictionSlip = this.getProperty("burnoutFrictionSlip", this.burnoutFrictionSlip);
            this.burnoutTimeDelay = this.getProperty("burnoutTimeDelay", this.burnoutTimeDelay);
            this.burnoutWheelPitch = this.getProperty("burnoutWheelPitch", this.burnoutWheelPitch);
            this.burnoutCoefficient = this.getProperty("burnoutCoefficient", this.burnoutCoefficient);
            this.burnoutTriggerMark = this.getProperty("burnoutTriggerMark", this.burnoutTriggerMark);
            this.enableBurnouts = this.getProperty("enableBurnouts", this.enableBurnouts);
            this.postNetworkAttributes = this.getProperty("postNetworkAttributes", this.postNetworkAttributes);
            this.linkTrackManager = this.getProperty("linkTrackManager", this.linkTrackManager);
            this.playVehicleSounds = this.getProperty("playVehicleSounds", this.playVehicleSounds);
            this.differentialRatio = this.getProperty("gearBoxDifferential", this.differentialRatio);
            this.transmissionRatio = this.getProperty("gearBoxOverdrive", this.transmissionRatio);
            this.gearBoxMultiplier = this.getProperty("gearBoxMultiplier", this.gearBoxMultiplier);
            this.gearBoxMaxPitching = this.getProperty("gearBoxMaxPitching", this.gearBoxMaxPitching);
            this.gearBoxShiftChange = this.getProperty("gearBoxShiftChange", this.gearBoxShiftChange);
            this.gearBoxShiftDelay = this.getProperty("gearBoxShiftDelay", this.gearBoxShiftDelay);
            this.gearBoxShiftRatios = this.getProperty("gearBoxShiftRatios", this.gearBoxShiftRatios);
            this.gearBoxShiftRanges = this.getProperty("gearBoxShiftRanges", this.gearBoxShiftRanges);
            this.MIN_RPM = this.getProperty("gearBoxMinPower", this.MIN_RPM);
            this.MAX_RPM = this.getProperty("gearBoxMaxPower", this.MAX_RPM);
            if (this.topSpeedDampener <= 0)
                this.topSpeedDampener = 0.15;
            if (this.maxBurnoutFactor <= 0)
                this.maxBurnoutFactor = 1.0;
            if (this.stableGravityFactor <= 0)
                this.stableGravityFactor = 4;
            if (this.smoothFlyingForce <= 0)
                this.smoothFlyingForce = 0;
            if (this.maxFrontBraking <= 0)
                this.maxFrontBraking = 0;
            if (this.maxReversePower <= 0)
                this.maxReversePower = 0.5;
            if (this.lowSpeedSteering <= 0)
                this.lowSpeedSteering = 5.0;
            if (this.highSpeedSteering <= 0)
                this.highSpeedSteering = 5.0;
            if (this.powerCoefficient <= 0)
                this.powerCoefficient = 1.0;
            if (this.topEngineSpeed <= 0)
                this.topEngineSpeed = 125;
            if (this.gearBoxMultiplier <= 0)
                this.gearBoxMultiplier = 1.0;
            if (this.gearBoxMaxPitching <= 0)
                this.gearBoxMaxPitching = 6500;
            if (this.gearBoxShiftChange <= 0)
                this.gearBoxShiftChange = 5100;
            if (this.gearBoxShiftDelay <= 0)
                this.gearBoxShiftDelay = 0.35;
            if (this.transmissionRatio <= 0)
                this.transmissionRatio = 1;
            if (this.differentialRatio <= 0)
                this.differentialRatio = 1;
            if (this.frictionLerpSpeed <= 0)
                this.frictionLerpSpeed = 1;
            if (this.burnoutLerpSpeed <= 0)
                this.burnoutLerpSpeed = 1;
            if (this.burnoutTimeDelay <= 0)
                this.burnoutTimeDelay = 1;
            if (this.burnoutWheelPitch <= 0)
                this.burnoutWheelPitch = 1;
            const steeringWheelNode = this.getProperty("steeringWheelHub");
            if (steeringWheelNode != null && steeringWheelNode.name != null && steeringWheelNode.name !== "") {
                this.steeringWheelHub = this.getChildNode(steeringWheelNode.name, UNITY.SearchType.IndexOf, false);
            }
            const angularDampener = this.getProperty("angularDampener");
            if (angularDampener != null)
                this.m_angularDampener = UNITY.Utilities.ParseVector3(angularDampener);
            const smokeTextureInfo = this.getProperty("smokeTexture");
            if (smokeTextureInfo != null) {
                this.smokeTexture = UNITY.Utilities.ParseTexture(smokeTextureInfo, this.scene);
            }
            const engineTorqueInfo = this.getProperty("engineTorque");
            if (engineTorqueInfo != null && engineTorqueInfo.animation != null) {
                this.engineTorqueCurve = BABYLON.Animation.Parse(engineTorqueInfo.animation);
            }
            if (this.engineTorqueCurve == null)
                UNITY.SceneManager.LogWarning("Failed to parse engine torque curve for: " + this.transform.name);
        }
        initVehicleState() {
            UNITY.Utilities.ValidateTransformQuaternion(this.transform);
            // Register Vehicle
            if (this.linkTrackManager === true)
                PROJECT.RaceTrackManager.RegisterVehicle(this.transform);
            // Setup Animator
            this._animator = this.getComponent("UNITY.AnimationState");
            if (this._animator == null) {
                const animationNode = this.getChildWithScript("UNITY.AnimationState");
                if (animationNode != null) {
                    this._animator = UNITY.SceneManager.FindScriptComponent(animationNode, "UNITY.AnimationState");
                }
                else {
                    // DEBUG: UNITY.SceneManager.LogWarning("Failed to locate animator node for: " + this.transform);
                }
            }
            // Setup Engine Audio
            this._engineAudioSource = this.getComponent("UNITY.AudioSource");
            if (this._engineAudioSource == null)
                UNITY.SceneManager.LogWarning("No engine audio source manager found for: " + this.transform.name);
            // Setup Raycast Vehicle
            this._rigidbody = this.getComponent("UNITY.RigidbodyPhysics");
            if (this.transform.physicsBody != null && this._rigidbody != null) {
                this.raycastVehicle = this._rigidbody.getRaycastVehicle();
                if (this.raycastVehicle != null) {
                    this.linearDamping = this.transform.physicsBody.getLinearDamping();
                    this.angularDamping = this.transform.physicsBody.getAngularDamping();
                    const brakeLightslName = (this.brakeLightsTrans != null && this.brakeLightsTrans.name != null && this.brakeLightsTrans.name !== "") ? this.brakeLightsTrans.name : null;
                    const reverseLightslName = (this.reverseLightsTrans != null && this.reverseLightsTrans.name != null && this.reverseLightsTrans.name !== "") ? this.reverseLightsTrans.name : null;
                    const frontLeftWheelName = (this.frontLeftWheelTrans != null && this.frontLeftWheelTrans.name != null && this.frontLeftWheelTrans.name !== "") ? this.frontLeftWheelTrans.name : null;
                    const frontRightWheelName = (this.frontRightWheelTrans != null && this.frontRightWheelTrans.name != null && this.frontRightWheelTrans.name !== "") ? this.frontRightWheelTrans.name : null;
                    const backLeftWheelName = (this.backLeftWheelTrans != null && this.backLeftWheelTrans.name != null && this.backLeftWheelTrans.name !== "") ? this.backLeftWheelTrans.name : null;
                    const backRightWheelName = (this.backRightWheelTrans != null && this.backRightWheelTrans.name != null && this.backRightWheelTrans.name !== "") ? this.backRightWheelTrans.name : null;
                    const frontLeftWheelLabel = (this.frontLeftWheelCollider != null && this.frontLeftWheelCollider.name != null && this.frontLeftWheelCollider.name !== "") ? this.frontLeftWheelCollider.name : null;
                    const frontRightWheelLabel = (this.frontRightWheelCollider != null && this.frontRightWheelCollider.name != null && this.frontRightWheelCollider.name !== "") ? this.frontRightWheelCollider.name : null;
                    const backLeftWheelLabel = (this.backLeftWheelCollider != null && this.backLeftWheelCollider.name != null && this.backLeftWheelCollider.name !== "") ? this.backLeftWheelCollider.name : null;
                    const backRightWheelLabel = (this.backRightWheelCollider != null && this.backRightWheelCollider.name != null && this.backRightWheelCollider.name !== "") ? this.backRightWheelCollider.name : null;
                    // Get Wheel Indexs From Wheel Names
                    if (frontLeftWheelLabel != null)
                        this.FRONT_LEFT = this.raycastVehicle.getWheelIndexByName(frontLeftWheelLabel);
                    if (frontRightWheelLabel != null)
                        this.FRONT_RIGHT = this.raycastVehicle.getWheelIndexByName(frontRightWheelLabel);
                    if (backLeftWheelLabel != null)
                        this.BACK_LEFT = this.raycastVehicle.getWheelIndexByName(backLeftWheelLabel);
                    if (backRightWheelLabel != null)
                        this.BACK_RIGHT = this.raycastVehicle.getWheelIndexByName(backRightWheelLabel);
                    // Get Brake & Reverse Lights Meshes
                    if (brakeLightslName != null) {
                        this.brakeLightsMesh = this.getChildNode(brakeLightslName, UNITY.SearchType.IndexOf, false);
                        if (this.brakeLightsMesh != null) {
                            this.brakeLightsMesh.isVisible = false;
                        }
                    }
                    if (reverseLightslName != null) {
                        this.reverseLightsMesh = this.getChildNode(reverseLightslName, UNITY.SearchType.IndexOf, false);
                        if (this.reverseLightsMesh != null) {
                            this.reverseLightsMesh.isVisible = false;
                        }
                    }
                    // Setup Wheel Info And Transform Meshes
                    if (this.raycastVehicle.getNumWheels() >= 4) {
                        if (this.BACK_LEFT >= 0 && backLeftWheelName != null) {
                            this.m_backLeftWheel = this.raycastVehicle.getWheelInfo(this.BACK_LEFT);
                            this.backLeftWheelMesh = this.getChildNode(backLeftWheelName, UNITY.SearchType.IndexOf, false);
                            if (this.backLeftWheelMesh != null) {
                                this.m_backLeftWheel.hub = this.backLeftWheelMesh;
                                this.m_backLeftWheel.spinner = UNITY.SceneManager.FindChildTransformNode(this.backLeftWheelMesh, "Wheel", UNITY.SearchType.IndexOf, true);
                                this.backLeftWheelEmitter = new BABYLON.AbstractMesh("Emitter_RL");
                                this.backLeftWheelEmitter.parent = this.m_backLeftWheel.spinner || this.backLeftWheelMesh;
                                this.backLeftWheelEmitter.position = new BABYLON.Vector3(0, 0, 0);
                                this.backLeftWheelParticle = this.createSmokeParticleSystem(this.transform.name + "Smoke_RL", this.backLeftWheelEmitter);
                                if (this.wheelDriveType === 0 || this.wheelDriveType === 2) { // REAR OR ALL WHEEL DRIVE
                                    if (this.wheelRadius <= 0 && this.m_backLeftWheel != null) {
                                        this.wheelRadius = this.m_backLeftWheel.radius;
                                    }
                                }
                            }
                        }
                        if (this.BACK_RIGHT >= 0 && backRightWheelName != null) {
                            this.m_backRightWheel = this.raycastVehicle.getWheelInfo(this.BACK_RIGHT);
                            this.backRightWheelMesh = this.getChildNode(backRightWheelName, UNITY.SearchType.IndexOf, false);
                            if (this.backRightWheelMesh != null) {
                                this.m_backRightWheel.hub = this.backRightWheelMesh;
                                this.m_backRightWheel.spinner = UNITY.SceneManager.FindChildTransformNode(this.backRightWheelMesh, "Wheel", UNITY.SearchType.IndexOf, true);
                                this.backRightWheelEmitter = new BABYLON.AbstractMesh("Emitter_RR");
                                this.backRightWheelEmitter.parent = this.m_backRightWheel.spinner || this.backRightWheelMesh;
                                this.backRightWheelEmitter.position = new BABYLON.Vector3(0, 0, 0);
                                this.backRightWheelParticle = this.createSmokeParticleSystem(this.transform.name + "Smoke_RR", this.backRightWheelEmitter);
                                if (this.wheelDriveType === 0 || this.wheelDriveType === 2) { // REAR OR ALL WHEEL DRIVE
                                    if (this.wheelRadius <= 0 && this.m_backRightWheel != null) {
                                        this.wheelRadius = this.m_backRightWheel.radius;
                                    }
                                }
                            }
                        }
                        if (this.FRONT_LEFT >= 0 && frontLeftWheelName != null) {
                            this.m_frontLeftWheel = this.raycastVehicle.getWheelInfo(this.FRONT_LEFT);
                            this.frontLeftWheelMesh = this.getChildNode(frontLeftWheelName, UNITY.SearchType.IndexOf, false);
                            if (this.frontLeftWheelMesh != null) {
                                this.m_frontLeftWheel.hub = this.frontLeftWheelMesh;
                                this.m_frontLeftWheel.spinner = UNITY.SceneManager.FindChildTransformNode(this.frontLeftWheelMesh, "Wheel", UNITY.SearchType.IndexOf, true);
                                this.frontLeftWheelEmitter = new BABYLON.AbstractMesh("Emitter_FL");
                                this.frontLeftWheelEmitter.parent = this.m_frontLeftWheel.spinner || this.frontLeftWheelMesh;
                                this.frontLeftWheelEmitter.position = new BABYLON.Vector3(0, 0, 0);
                                this.frontLeftWheelParticle = this.createSmokeParticleSystem(this.transform.name + "Smoke_FL", this.frontLeftWheelEmitter);
                                if (this.wheelDriveType === 1 || this.wheelDriveType === 2) { // FRONT OR ALL WHEEL DRIVE
                                    if (this.wheelRadius <= 0 && this.m_frontLeftWheel != null) {
                                        this.wheelRadius = this.m_frontLeftWheel.radius;
                                    }
                                }
                            }
                        }
                        if (this.FRONT_RIGHT >= 0 && frontRightWheelName != null) {
                            this.m_frontRightWheel = this.raycastVehicle.getWheelInfo(this.FRONT_RIGHT);
                            this.frontRightWheelMesh = this.getChildNode(frontRightWheelName, UNITY.SearchType.IndexOf, false);
                            if (this.frontRightWheelMesh != null) {
                                this.m_frontRightWheel.hub = this.frontRightWheelMesh;
                                this.m_frontRightWheel.spinner = UNITY.SceneManager.FindChildTransformNode(this.frontRightWheelMesh, "Wheel", UNITY.SearchType.IndexOf, true);
                                this.frontRightWheelEmitter = new BABYLON.AbstractMesh("Emitter_FR");
                                this.frontRightWheelEmitter.parent = this.m_frontRightWheel.spinner || this.frontRightWheelMesh;
                                this.frontRightWheelEmitter.position = new BABYLON.Vector3(0, 0, 0);
                                this.frontRightWheelParticle = this.createSmokeParticleSystem(this.transform.name + "Smoke_FR", this.frontRightWheelEmitter);
                                if (this.wheelDriveType === 1 || this.wheelDriveType === 2) { // FRONT OR ALL WHEEL DRIVE
                                    if (this.wheelRadius <= 0 && this.m_frontRightWheel != null) {
                                        this.wheelRadius = this.m_frontRightWheel.radius;
                                    }
                                }
                            }
                        }
                        // ..
                        // Setup Stabilzation
                        // ..
                        this.raycastVehicle.setSmoothFlyingImpulse(this.smoothFlyingForce);
                        this.raycastVehicle.setStabilizingForce(this.stableGravityFactor);
                        // ..
                        // Setup Collision Filter
                        // ..
                        // m_collisionFilterGroup → filterMembershipMask
                        // m_collisionFilterMask → filterCollideMask
                        // ..
                        // this.raycastVehicle.setCollisionFilterGroup(UNITY.CollisionFilters.DefaultFilter);
                        // this.raycastVehicle.setCollisionFilterMask(UNITY.CollisionFilters.StaticFilter);
                        // ..
                        // Setup Skid Audio Sources
                        // ..
                        if (this._skidAudioSource == null && this.backRightWheelMesh != null)
                            this._skidAudioSource = UNITY.SceneManager.FindScriptComponent(this.backRightWheelMesh, "UNITY.AudioSource");
                        if (this._skidAudioSource == null && this.backLeftWheelMesh != null)
                            this._skidAudioSource = UNITY.SceneManager.FindScriptComponent(this.backLeftWheelMesh, "UNITY.AudioSource");
                        if (this._skidAudioSource == null && this.frontRightWheelMesh != null)
                            this._skidAudioSource = UNITY.SceneManager.FindScriptComponent(this.frontRightWheelMesh, "UNITY.AudioSource");
                        if (this._skidAudioSource == null && this.frontLeftWheelMesh != null)
                            this._skidAudioSource = UNITY.SceneManager.FindScriptComponent(this.frontLeftWheelMesh, "UNITY.AudioSource");
                        if (this._skidAudioSource == null)
                            UNITY.SceneManager.LogWarning("No skid audio source manager found for: " + this.transform.name);
                    }
                    else {
                        UNITY.SceneManager.LogWarning("Invalid vehicle controller wheel count info for: " + this.transform.name);
                    }
                }
                else {
                    UNITY.SceneManager.LogWarning("No wheel collider information found for: " + this.transform.name);
                }
            }
            else {
                UNITY.SceneManager.LogWarning("Failed to get rigidbody component: " + this.transform.name);
            }
        }
        updateVehicleState() {
            this.m_linearVelocity = this.transform.absolutePosition.subtract(this.m_lastPosition);
            this.m_scaledVelocity = (this.m_linearVelocity.length() / this.getDeltaSeconds());
            this.m_linearVelocity.normalize();
            this.m_linearVelocity.scaleInPlace(this.m_scaledVelocity);
            if (this.wheelDrawVelocity > 0) {
                this.m_velocityOffset.copyFrom(this.m_linearVelocity);
                this.m_velocityOffset.scaleInPlace(this.wheelDrawVelocity);
            }
            else {
                this.m_velocityOffset.set(0, 0, 0);
            }
            this.m_lastPosition.copyFrom(this.transform.absolutePosition);
            this.castWheelContactRays();
        }
        destroyVehicleState() {
            this._rigidbody = null;
            this._engineAudioSource = null;
            this._skidAudioSource = null;
            if (this.m_frontLeftWheel != null) {
                //havokInstance.destroy(this.m_frontLeftWheel); // ???
                this.m_frontLeftWheel = null;
            }
            if (this.m_frontRightWheel != null) {
                //havokInstance.destroy(this.m_frontRightWheel); // ???
                this.m_frontRightWheel = null;
            }
            if (this.m_backLeftWheel != null) {
                //havokInstance.destroy(this.m_backLeftWheel); // ???
                this.m_backLeftWheel = null;
            }
            if (this.m_backRightWheel != null) {
                //havokInstance.destroy(this.m_backRightWheel); // ???
                this.m_backRightWheel = null;
            }
            this.raycastVehicle = null;
            this.frontLeftWheelMesh = null;
            this.frontRightWheelMesh = null;
            this.backLeftWheelMesh = null;
            this.backRightWheelMesh = null;
            this.frontLeftWheelTrans = null;
            this.frontRightWheelTrans = null;
            this.backLeftWheelTrans = null;
            this.backRightWheelTrans = null;
            this.frontLeftWheelCollider = null;
            this.frontRightWheelCollider = null;
            this.backLeftWheelCollider = null;
            this.backRightWheelCollider = null;
        }
        /** Drives the raycast vehicle with the specfied movement properties. */
        drive(throttle, steering, braking, donuts, booster = 0, autopilot = false) {
            const deltaTime = this.getDeltaSeconds();
            this.currentForward = BABYLON.Scalar.Clamp(throttle, -1, 1);
            this.currentTurning = BABYLON.Scalar.Clamp(steering, -1, 1);
            this.currentSkidding = braking;
            this.currentDonuts = donuts;
            // ..
            // Update Driving System
            // ..
            this.handBraking = (this.getCurrentSkidding() === true && this.handBrakingForce > 0);
            if (this.handBraking === true) {
                this.handBrakingTimer += deltaTime;
            }
            else {
                this.handBrakingTimer = 0;
            }
            if (this._rigidbody == null || this.raycastVehicle == null)
                return;
            if (this.FRONT_LEFT >= 0 && this.FRONT_RIGHT >= 0 && this.BACK_LEFT >= 0 && this.BACK_RIGHT >= 0) {
                this.engineForce = 0;
                this.wheelBrakingForce = 0;
                this.frontWheelPower = 0;
                this.backWheelPower = 0;
                // ..
                // Update Engine Forces
                // ..
                const throttleSpeed = (this.throttleEngineSpeed > 0) ? this.throttleEngineSpeed : this.topEngineSpeed;
                const gearShiftRatio = (this.gearBoxShiftRatios != null && this.gearBoxShiftRatios.length > this.gearIndex) ? this.gearBoxShiftRatios[this.gearIndex] : 1.0;
                const finalGearRatio = (gearShiftRatio * this.differentialRatio * this.transmissionRatio);
                const engineMotorTorque = this.getVehicleEngineTorque(this.engineRPM, booster) * Math.abs(this.currentForward);
                const allowedEnginePower = (engineMotorTorque * finalGearRatio);
                let allowedBrakingForce = BABYLON.Scalar.Lerp(this.minBrakingForce, this.maxBrakingForce, this.gradientSpeed) * Math.abs(this.currentForward);
                if (this.currentForward > 0 && this.wheelBurnout === true && this.wheelDonuts === true) {
                    this.engineForce = allowedEnginePower;
                }
                else {
                    if (this.currentForward > 0) { // Forward
                        // TODO - Support Right Handed
                        if (this.forwardSpeed < -1)
                            this.wheelBrakingForce = allowedBrakingForce;
                        else
                            this.engineForce = allowedEnginePower;
                    }
                    else if (this.currentForward < 0) { // Reverse
                        // TODO - Support Right Handed
                        if (this.forwardSpeed > 1)
                            this.wheelBrakingForce = allowedBrakingForce;
                        else
                            this.engineForce = -(allowedEnginePower * this.maxReversePower);
                    }
                    else { // Static
                        this.engineForce = 0;
                        this.wheelBrakingForce = 10;
                    }
                }
                let engineBrake = 0;
                if (this.shiftingTime > 0 || this.americanSpeed > throttleSpeed) {
                    engineBrake = this.shiftingBrake;
                    this.engineForce = 0;
                }
                WM.PrintToScreen("MPH: " + this.americanSpeed.toFixed(2) + " --> RPM: " + this.engineRPM.toFixed(2) + " ENGINE: -->: " + this.engineForce.toFixed(2) + " --> VELOCITY: " + this.transform.physicsBody.getLinearVelocity().length().toFixed(2));
                // ..
                // Update Vehicle Steering
                // ..
                let visualSteerBoost = 0;
                let ackermanSteerLeft = 0;
                let ackermanSteerRight = 0;
                let steeringBoost = (Math.abs(this.currentTurning) >= 0.02); // Note: Max Range (0.02 - 0.04)
                let steeringRadius = (this.ackermanTurnRadius * this.ackermanTurnFactor); // Note: Smaller Steering Radius Equals Sharper Turning
                let steeringAmount = BABYLON.Scalar.Lerp(this.lowSpeedSteering, this.highSpeedSteering, this.gradientSpeed);
                let steeringGradient = (steeringAmount * deltaTime);
                // ..
                // Use Ackerman Steering Formulas
                // ..
                if (this.currentTurning > 0) { // Right
                    if (this.maxSteerBoost > 0 && steeringBoost === true)
                        visualSteerBoost = BABYLON.Tools.ToRadians(this.maxSteerBoost);
                    ackermanSteerLeft = Math.atan(this.ackermanWheelBase / (steeringRadius + (this.ackermanRearTrack / 2))) * this.currentTurning;
                    ackermanSteerRight = Math.atan(this.ackermanWheelBase / (steeringRadius - (this.ackermanRearTrack / 2))) * this.currentTurning;
                }
                else if (this.currentTurning < 0) { // Left
                    if (this.maxSteerBoost > 0 && steeringBoost === true)
                        visualSteerBoost = -BABYLON.Tools.ToRadians(this.maxSteerBoost);
                    ackermanSteerLeft = Math.atan(this.ackermanWheelBase / (steeringRadius - (this.ackermanRearTrack / 2))) * this.currentTurning;
                    ackermanSteerRight = Math.atan(this.ackermanWheelBase / (steeringRadius + (this.ackermanRearTrack / 2))) * this.currentTurning;
                }
                else {
                    visualSteerBoost = 0;
                    ackermanSteerLeft = 0;
                    ackermanSteerRight = 0;
                }
                if (this.wheelBurnout === true && this.wheelDonuts === true) {
                    ackermanSteerLeft *= this.maxBurnoutFactor;
                    ackermanSteerRight *= this.maxBurnoutFactor;
                }
                else if (autopilot === false) { // Assisted
                    const smoothSteerFactor = BABYLON.Scalar.Lerp(1.0, this.topSpeedDampener, this.gradientSpeed);
                    ackermanSteerLeft *= smoothSteerFactor;
                    ackermanSteerRight *= smoothSteerFactor;
                }
                // ..
                // Smooth Physics Steering Angles
                // ..
                this.physicsSteerAngleL = BABYLON.Scalar.Lerp(this.physicsSteerAngleL, ackermanSteerLeft, steeringGradient);
                this.physicsSteerAngleR = BABYLON.Scalar.Lerp(this.physicsSteerAngleR, ackermanSteerRight, steeringGradient);
                // ..
                // Smooth Visual Steering Angles
                // ..
                this.visualSteerBoostL = (ackermanSteerLeft + visualSteerBoost);
                this.visualSteerBoostR = (ackermanSteerRight + visualSteerBoost);
                if (this.overSteerSpeed > 0 && this.handBraking === true && this.handBrakingTimer > this.overSteerTimeout) {
                    this.visualSteerBoostL *= -1; // Note: Invert Over Steering Angle
                    this.visualSteerBoostR *= -1; // Note: Invert Over Steering Angle
                }
                this.visualSteerAngleL = BABYLON.Scalar.Lerp(this.visualSteerAngleL, this.visualSteerBoostL, steeringGradient);
                this.visualSteerAngleR = BABYLON.Scalar.Lerp(this.visualSteerAngleR, this.visualSteerBoostR, steeringGradient);
                // ..
                // Smooth Steering Wheel Angles
                // ..
                let steeringAngleBoost = 2.0;
                let steeringAngleFactor = Math.abs(this.currentTurning) * steeringAngleBoost;
                if (this.currentTurning > 0) { // Right
                    steeringAngleFactor = BABYLON.Scalar.Clamp(steeringAngleFactor, 0, 1);
                }
                else if (this.currentTurning < 0) { // Left
                    steeringAngleFactor = -BABYLON.Scalar.Clamp(steeringAngleFactor, 0, 1);
                }
                let fixedCurrentTurning = (this.overSteerSpeed > 0 && this.handBraking === true && this.handBrakingTimer > this.overSteerTimeout) ? steeringAngleFactor : -steeringAngleFactor;
                this.animatorSteerAngle = BABYLON.Scalar.Lerp(this.animatorSteerAngle, fixedCurrentTurning, (this.maxSteeringSpeed * deltaTime));
                // ..
                // ..
                if (this.steeringWheelHub != null) {
                    if (this.steeringWheelHub.rotationQuaternion == null) {
                        this.steeringWheelHub.rotationQuaternion = BABYLON.Quaternion.FromEulerVector(this.steeringWheelHub.rotation);
                    }
                    const degreesSteerAngle = (this.animatorSteerAngle * this.maxSteeringAngle);
                    const radiansSteerAngle = BABYLON.Tools.ToRadians(degreesSteerAngle);
                    const xaxis = (this.steeringWheelAxis === 0) ? radiansSteerAngle : 0;
                    const yaxis = (this.steeringWheelAxis === 1) ? radiansSteerAngle : 0;
                    const zaxis = (this.steeringWheelAxis === 2) ? radiansSteerAngle : 0;
                    BABYLON.Quaternion.SlerpToRef(this.steeringWheelHub.rotationQuaternion, BABYLON.Quaternion.FromEulerAngles(xaxis, yaxis, zaxis), (this.maxSteeringSpeed * deltaTime), this.steeringWheelHub.rotationQuaternion);
                }
                if (this._animator != null)
                    this._animator.setFloat("TurnAngle", this.animatorSteerAngle); // Note: Fixed Animation Turning Angle (-1 To +1)
                // ..
                // Update Raycast Vehicle Controls
                // ..
                let updateFriction = true;
                if (this.handBraking === true) {
                    this.wheelBurnout = false;
                    this.wheelDonuts = false;
                    this.burnoutTimer = 0;
                    // ..
                    // Validate Wheel Skidding Mode
                    // ..
                    if (this.raycastVehicle.lockedWheelIndexes == null)
                        this.raycastVehicle.lockedWheelIndexes = [this.BACK_LEFT, this.BACK_RIGHT];
                    if (this.americanSpeed >= 1) {
                        if (this.wheelSkidding === false) {
                            this.wheelSkidding = true;
                            this.skiddingTime = this.brakeRecoveryDelay;
                            const wheelSkidFriction = 0; // Default Wheel Skidding Frintion Drop Value
                            if (this.m_frontLeftWheel != null)
                                this.m_frontLeftWheel.frictionSlip = wheelSkidFriction;
                            if (this.m_frontRightWheel != null)
                                this.m_frontRightWheel.frictionSlip = wheelSkidFriction;
                            if (this.m_backLeftWheel != null)
                                this.m_backLeftWheel.frictionSlip = wheelSkidFriction;
                            if (this.m_backRightWheel != null)
                                this.m_backRightWheel.frictionSlip = wheelSkidFriction;
                            this.frontLeftFrictionPenalty = false;
                            this.frontRightFrictionPenalty = false;
                            this.rearLeftFrictionPenalty = false;
                            this.rearRightFrictionPenalty = false;
                            updateFriction = false; // Note: Disable Friction Lerping This Frame
                        }
                    }
                    // ..
                    // Update Vehicle Wheel Information
                    // ..
                    if (this.skiddingTime <= 0) {
                        this.updateLinearBrakeDamping(this.linearBrakingForce, (deltaTime * this.brakeRecoverySpeed));
                        this.updateAngularBrakeDamping(this.angularBrakingForce, (deltaTime * this.brakeRecoverySpeed));
                        if (updateFriction === true && this.americanSpeed <= 0.25)
                            this.updateCurrentFrictionSlip(deltaTime * this.skidRecoverySpeed);
                    }
                    this.updateCurrentRotationDelta(0);
                    this.updateCurrentRotationBoost(0);
                    // ..
                    this.raycastVehicle.setVisualSteeringAngle(this.visualSteerAngleL, this.FRONT_LEFT);
                    this.raycastVehicle.setVisualSteeringAngle(this.visualSteerAngleR, this.FRONT_RIGHT);
                    this.raycastVehicle.setPhysicsSteeringAngle(this.physicsSteerAngleL, this.FRONT_LEFT);
                    this.raycastVehicle.setPhysicsSteeringAngle(this.physicsSteerAngleR, this.FRONT_RIGHT);
                    // ..
                    this.raycastVehicle.setEngineForce(0, this.FRONT_LEFT);
                    this.raycastVehicle.setEngineForce(0, this.FRONT_RIGHT);
                    this.raycastVehicle.setEngineForce(0, this.BACK_LEFT);
                    this.raycastVehicle.setEngineForce(0, this.BACK_RIGHT);
                    // ..
                    const frontBrakeForce = (this.handBrakingForce * 0.1);
                    this.raycastVehicle.setBrakingForce(frontBrakeForce, this.FRONT_LEFT);
                    this.raycastVehicle.setBrakingForce(frontBrakeForce, this.FRONT_RIGHT);
                    // ..
                    const extraBrakeForce = (this.handBrakingForce * 10000);
                    this.raycastVehicle.setBrakingForce(extraBrakeForce, this.BACK_LEFT);
                    this.raycastVehicle.setBrakingForce(extraBrakeForce, this.BACK_RIGHT);
                }
                else {
                    if (this.raycastVehicle.lockedWheelIndexes != null) {
                        this.raycastVehicle.lockedWheelIndexes = null;
                        this.updateCurrentRotationDelta(0);
                        this.updateCurrentRotationBoost(0);
                    }
                    this.wheelSkidding = false;
                    this.skiddingTime = 0;
                    this.burnoutCoefficient = BABYLON.Scalar.Clamp(this.burnoutCoefficient, 1, 20);
                    this.burnoutTriggerMark = BABYLON.Scalar.Clamp(this.burnoutTriggerMark, 1, 20);
                    // ..
                    const isBurnoutSpeed = (this.americanSpeed <= this.burnoutTriggerMark);
                    const isFullThrottle = (this.currentForward < -0.9 || this.currentForward > 0.9);
                    const isFullTurning = (this.currentTurning < -0.9 || this.currentTurning > 0.9);
                    let wheelLerpSpeed = (deltaTime * this.frictionLerpSpeed);
                    let wheelBoostSpeed = 0; // Default Zero Wheel Rotation Boost
                    // ..
                    // Validate Wheel Burnout Mode
                    // ..
                    if (this.burnoutTimer <= 0 && isFullThrottle === true && isBurnoutSpeed === true && this.enableBurnouts === true) {
                        this.burnoutTimer = (this.burnoutTimeDelay * 0.25); // Note: 25 Percent Slipping Time
                        this.wheelDonuts = false;
                        this.wheelBurnout = true;
                    }
                    // ..
                    // Validate Wheel Burnout Timers
                    // ..
                    if (this.restoreTimer > 0) {
                        this.restoreTimer -= deltaTime;
                        if (this.restoreTimer < 0)
                            this.restoreTimer = 0;
                        wheelLerpSpeed *= this.burnoutLerpSpeed;
                    }
                    if (this.cooldownTimer > 0) {
                        this.cooldownTimer -= deltaTime;
                        if (this.cooldownTimer < 0)
                            this.cooldownTimer = 0;
                    }
                    if (this.wheelDonuts === true) {
                        this.donutSpinTime += deltaTime;
                        if (isFullTurning === false) {
                            this.burnoutTimer = 0;
                        }
                    }
                    else {
                        this.donutSpinTime = 0;
                    }
                    // ..
                    // Validate Wheel Drive Burnout Mode
                    // ..
                    if (this.burnoutTimer > 0 && isFullThrottle === true) {
                        wheelBoostSpeed = 0.2;
                        const frontSlipFactor = (this.wheelDonuts === true) ? 1.25 : 1.0;
                        if (this.burnoutCoefficient >= 1.0)
                            this.engineForce *= this.burnoutCoefficient;
                        if (this.m_frontLeftWheel != null)
                            this.m_frontLeftWheel.frictionSlip = (this.burnoutFrictionSlip * frontSlipFactor);
                        if (this.m_frontRightWheel != null)
                            this.m_frontRightWheel.frictionSlip = (this.burnoutFrictionSlip * frontSlipFactor);
                        if (this.m_backLeftWheel != null)
                            this.m_backLeftWheel.frictionSlip = this.burnoutFrictionSlip;
                        if (this.m_backRightWheel != null)
                            this.m_backRightWheel.frictionSlip = this.burnoutFrictionSlip;
                        this.frontLeftFrictionPenalty = false;
                        this.frontRightFrictionPenalty = false;
                        this.rearLeftFrictionPenalty = false;
                        this.rearRightFrictionPenalty = false;
                        updateFriction = false; // Note: Disable Friction Lerping This Frame
                        // ..
                        this.burnoutTimer -= deltaTime;
                        if (this.burnoutTimer <= 0 && isFullTurning === true && this.cooldownTimer <= 0 && this.currentForward > 0 && this.currentDonuts === true) {
                            this.burnoutTimer = 0.01; // Note: Use Fixed Donut Burnout Time Extension
                            //this.wheelDonuts = true;            // Note: Disable Wheel Donuts Extra Power Needed
                        }
                    }
                    else {
                        if (this.americanSpeed >= this.minPenaltySpeed && this.frictionWheelSlip > 0) {
                            if (this.frontLeftFrictionLerping === false && this.frontLeftContactTag === this.penaltyGroundTag) {
                                if (this.m_frontLeftWheel != null && this.m_frontLeftWheel.defaultFriction != null) {
                                    const frontLeftFriction = this.m_frontLeftWheel.defaultFriction * (this.frictionWheelSlip * 1.25);
                                    this.m_frontLeftWheel.frictionSlip = frontLeftFriction;
                                    this.frontLeftFrictionPenalty = true;
                                    updateFriction = false; // Note: Disable Friction Lerping This Frame
                                }
                            }
                            if (this.frontRightFrictionLerping === false && this.frontRightContactTag === this.penaltyGroundTag) {
                                if (this.m_frontRightWheel != null && this.m_frontRightWheel.defaultFriction != null) {
                                    const frontRightFriction = this.m_frontRightWheel.defaultFriction * (this.frictionWheelSlip * 1.25);
                                    this.m_frontRightWheel.frictionSlip = frontRightFriction;
                                    this.frontRightFrictionPenalty = true;
                                    updateFriction = false; // Note: Disable Friction Lerping This Frame
                                }
                            }
                            if (this.rearLeftFrictionLerping === false && this.rearLeftContactTag === this.penaltyGroundTag) {
                                if (this.m_backLeftWheel != null && this.m_backLeftWheel.defaultFriction != null) {
                                    const backLeftFriction = this.m_backLeftWheel.defaultFriction * this.frictionWheelSlip;
                                    this.m_backLeftWheel.frictionSlip = backLeftFriction;
                                    this.rearLeftFrictionPenalty = true;
                                    updateFriction = false; // Note: Disable Friction Lerping This Frame
                                }
                            }
                            if (this.rearRightFrictionLerping === false && this.rearRightContactTag === this.penaltyGroundTag) {
                                if (this.m_backRightWheel != null && this.m_backRightWheel.defaultFriction != null) {
                                    const backRightFriction = this.m_backRightWheel.defaultFriction * this.frictionWheelSlip;
                                    this.m_backRightWheel.frictionSlip = backRightFriction;
                                    this.rearRightFrictionPenalty = true;
                                    updateFriction = false; // Note: Disable Friction Lerping This Frame
                                }
                            }
                        }
                        // ..
                        this.burnoutTimer = 0; // Note: Clear Burnout Timer 
                        this.donutSpinTime = 0; // Note: Clear Donut Spin Time
                        if (this.wheelDonuts === true) {
                            this.wheelDonuts = false;
                            this.cooldownTimer = (this.burnoutTimeDelay * 2); // Note: 200 Percent Cooldown Time
                        }
                        if (this.wheelBurnout === true) {
                            this.wheelBurnout = false;
                            this.restoreTimer = (this.burnoutTimeDelay * 0.75); // Note: 75 Percent Restoring Time
                        }
                    }
                    // ..
                    // Validate Wheel Drive Power Force
                    // ..
                    if (this.wheelBurnout === true && this.wheelDonuts === true) {
                        this.frontWheelPower = (this.engineForce * 0.2); // Note: 20 Percent Engine Power Force
                    }
                    else if (this.wheelDriveType === 1 || this.wheelDriveType === 2) { // FRONT OR ALL WHEEL DRIVE
                        this.frontWheelPower = this.engineForce;
                    }
                    if (this.wheelDriveType === 0 || this.wheelDriveType === 2) { // REAR OR ALL WHEEL DRIVE
                        this.backWheelPower = this.engineForce;
                    }
                    // ..
                    // Update Vehicle Wheel Information
                    // ..
                    if (this.getFootBraking() === true)
                        this.updateCurrentBrakeDamping((this.linearBrakingForce * 0.05), (this.angularBrakingForce * 0.05)); // Note: 5 Percent Linear Brake Force
                    else if (this.throttleBrakingForce > 0)
                        this.updateCurrentBrakeDamping(this.throttleBrakingForce, this.angularDamping);
                    else if (this.engineForce !== 0)
                        this.updateCurrentBrakeDamping(engineBrake, this.angularDamping);
                    else
                        this.updateCurrentBrakeDamping(this.linearDamping, this.angularDamping);
                    // ..
                    if (updateFriction === true)
                        this.updateCurrentFrictionSlip(wheelLerpSpeed);
                    this.updateCurrentRotationBoost(wheelBoostSpeed);
                    // ..
                    this.raycastVehicle.setVisualSteeringAngle(this.visualSteerAngleL, this.FRONT_LEFT);
                    this.raycastVehicle.setVisualSteeringAngle(this.visualSteerAngleR, this.FRONT_RIGHT);
                    this.raycastVehicle.setPhysicsSteeringAngle(this.physicsSteerAngleL, this.FRONT_LEFT);
                    this.raycastVehicle.setPhysicsSteeringAngle(this.physicsSteerAngleR, this.FRONT_RIGHT);
                    // ..
                    this.raycastVehicle.setEngineForce(this.frontWheelPower, this.FRONT_LEFT);
                    this.raycastVehicle.setEngineForce(this.frontWheelPower, this.FRONT_RIGHT);
                    this.raycastVehicle.setEngineForce(this.backWheelPower, this.BACK_LEFT);
                    this.raycastVehicle.setEngineForce(this.backWheelPower, this.BACK_RIGHT);
                    // ..
                    if (this.maxFrontBraking > 0) {
                        this.raycastVehicle.setBrakingForce(this.wheelBrakingForce * this.maxFrontBraking, this.FRONT_LEFT);
                        this.raycastVehicle.setBrakingForce(this.wheelBrakingForce * this.maxFrontBraking, this.FRONT_RIGHT);
                    }
                    else {
                        this.raycastVehicle.setBrakingForce(this.wheelBrakingForce, this.FRONT_LEFT);
                        this.raycastVehicle.setBrakingForce(this.wheelBrakingForce, this.FRONT_RIGHT);
                    }
                    this.raycastVehicle.setBrakingForce(this.wheelBrakingForce, this.BACK_LEFT);
                    this.raycastVehicle.setBrakingForce(this.wheelBrakingForce, this.BACK_RIGHT);
                }
            }
            // ..
            // Update Driving Props
            // ..
            this.syncVehicleState();
        }
        syncVehicleState() {
            const deltaTime = this.getDeltaSeconds();
            const gearCount = this.getGearShiftRatioCount();
            if (this.skiddingTime > 0) {
                this.skiddingTime -= deltaTime;
                if (this.skiddingTime < 0)
                    this.skiddingTime = 0;
            }
            if (this.shiftingTime > 0) {
                this.shiftingTime -= deltaTime;
                if (this.shiftingTime < 0)
                    this.shiftingTime = 0;
            }
            if (this._rigidbody != null && this.raycastVehicle != null) {
                const deadSpeed = 0.2; // Note: Dead Movement Speed Threshold
                this.forwardSpeed = this.raycastVehicle.getRawCurrentSpeedKph() * PROJECT.StandardCarController.DEFAULT_SPEED_FACTOR;
                if (Math.abs(this.forwardSpeed) < deadSpeed)
                    this.forwardSpeed = 0;
                // ..
                this.absoluteSpeed = this.raycastVehicle.getAbsCurrentSpeedKph() * PROJECT.StandardCarController.DEFAULT_SPEED_FACTOR;
                if (this.absoluteSpeed < deadSpeed)
                    this.absoluteSpeed = 0;
                // ..
                this.americanSpeed = (this.absoluteSpeed * UNITY.System.Kph2Mph);
                this.gradientSpeed = BABYLON.Scalar.Clamp((this.absoluteSpeed / this.topEngineSpeed)); // Note: Absoulte Speed To Dampen Normalized Speed
                //this.gradientSpeed = BABYLON.Scalar.Clamp((this.americanSpeed / this.topEngineSpeed)); // Note: American Speed To Dampen Normalized Speed
                // ..
                if (this.gearBoxShiftRatios != null && this.gearIndex >= 0 && this.gearIndex < gearCount) {
                    const minimumDelta = Math.min(Math.max(deltaTime, 1 / 200), 1);
                    const wheelDiameter = (this.wheelRadius * 2 * UNITY.System.Meter2Inch);
                    const finalGearRatio = (this.gearBoxShiftRatios[this.gearIndex] * this.differentialRatio * this.transmissionRatio);
                    const engineLevelFactor = 336;
                    // ..
                    // Update Engine Revolutions (TODO - No Shifting Donut Mode - RPM Bounce Boosting)
                    // ..
                    this.downShift = (this.gearBoxShiftRanges != null && this.gearBoxShiftRanges.length === this.gearBoxShiftRatios.length) ? this.gearBoxShiftRanges[this.gearIndex] : 1000;
                    this.clutchSlip = BABYLON.Scalar.Lerp(this.clutchSlip, 0, 1 - Math.pow(0.01, minimumDelta));
                    this.engineRPM = ((this.americanSpeed * finalGearRatio * engineLevelFactor) / wheelDiameter);
                    /////////////////////////////////////////////////////////
                    // TODO - Lock High Pitching RPM While Skidding & Donuts
                    /////////////////////////////////////////////////////////
                    this.pitchRPM = BABYLON.Scalar.Lerp(this.shiftRPM, this.engineRPM, (1 - this.clutchSlip)) + this.MIN_RPM;
                    /////////////////////////////////////////////////////////
                    /* Penny - Change Gears
                    float speedPercentage = Mathf.Abs(currentSpeed / maxSpeed);
                    float upperGearMax = (1 / (float)numGears) * (currentGear + 1);
                    float downGearMax = (1 / (float)numGears) * currentGear;
            
                    if (currentGear > 0 && speedPercentage < downGearMax)
                        currentGear--;
            
                    if (speedPercentage > upperGearMax && (currentGear < (numGears - 1)))
                        currentGear++;
                    */
                    // ..
                    // Update Engine Gearing Box (TODO - No Shifting Donut Mode - RPM Bounce Boosting)
                    // ..
                    if (this.americanSpeed < 5) {
                        this.gearIndex = 0;
                    }
                    else {
                        if (this.engineRPM > this.gearBoxShiftChange) {
                            // DEPRECIATED: Moved To If Statement Below
                            // this.shiftRPM = this.engineRPM;
                            // this.clutchSlip = 1.0;
                            // this.shiftingTime = this.gearBoxShiftDelay;
                            if (this.gearIndex < (gearCount - 1)) {
                                this.shiftRPM = this.engineRPM;
                                this.clutchSlip = 1.0;
                                this.shiftingTime = this.gearBoxShiftDelay;
                                this.gearIndex++;
                            }
                        }
                        else if (this.engineRPM < this.downShift) {
                            // DEPRECIATED: Moved To If Statement Below
                            // this.shiftRPM = this.engineRPM;
                            // this.clutchSlip = 1.0;
                            // this.shiftingTime = 0;
                            if (this.gearIndex > 0) {
                                this.shiftRPM = this.engineRPM;
                                this.clutchSlip = 1.0;
                                this.shiftingTime = 0;
                                this.gearIndex--;
                            }
                        }
                    }
                    ///////////////////////////////////////
                    // Double Check Gear Index - ???
                    ///////////////////////////////////////
                    if (this.gearIndex < 0)
                        this.gearIndex = 0;
                    else if (this.gearIndex >= gearCount)
                        this.gearIndex = (gearCount - 1);
                }
            }
            // Update Engine Sound Pitch
            this.enginePitchLevel = (this.getCurrentEnginePitch() * PROJECT.StandardCarController.DEFAULT_PITCH_FACTOR * this.gearBoxMultiplier);
            if (this.playVehicleSounds === true) {
                if (this._engineAudioSource != null) {
                    const engineSoundClip = this._engineAudioSource.getSoundClip();
                    if (engineSoundClip != null)
                        engineSoundClip.setPlaybackRate(this.enginePitchLevel);
                }
            }
            // Update Smoke Instensity
            this.smokeDonuts = BABYLON.Scalar.Clamp(this.smokeDonuts, 1, 10);
            this.smokeIntensityFactor = this.smokeIntensity;
            if (this.wheelBurnout === true && this.wheelDonuts === true)
                this.smokeIntensityFactor *= this.smokeDonuts;
            /* DEBUG: WHEEL COLLISIONS
            const fl_wheel = this.raycastVehicle.getWheelInfo(this.FRONT_LEFT);
            const fr_wheel = this.raycastVehicle.getWheelInfo(this.FRONT_RIGHT);
            const bl_wheel = this.raycastVehicle.getWheelInfo(this.BACK_LEFT);
            const br_wheel = this.raycastVehicle.getWheelInfo(this.BACK_RIGHT);
            let fl_collide:string = "";
            if (fl_wheel.raycastResult != null && fl_wheel.raycastResult.body != null) {
                fl_collide = fl_wheel.raycastResult.body.transformNode.name;
            }
            let fr_collide:string = "";
            if (fr_wheel.raycastResult != null && fr_wheel.raycastResult.body != null) {
                fr_collide = fr_wheel.raycastResult.body.transformNode.name;
            }

            let bl_collide:string = "";
            if (bl_wheel.raycastResult != null && bl_wheel.raycastResult.body != null) {
                bl_collide = bl_wheel.raycastResult.body.transformNode.name;
            }
            let br_collide:string = "";
            if (br_wheel.raycastResult != null && br_wheel.raycastResult.body != null) {
                br_collide = br_wheel.raycastResult.body.transformNode.name;
            }
            console.log("Wheel Collides - FL: " + fl_collide + " --> FR: " +  fr_collide + " --> BL: " + bl_collide + " --> BR: " + br_collide);
            */
            // Update Wheel Skidding Info
            this.SKID_FL = 0, this.SKID_FR = 0, this.SKID_RL = 0, this.SKID_RR = 0;
            if (this.m_frontLeftWheel != null) {
                const wheelContactFL = (this.m_frontLeftWheel.raycastResult.body != null);
                this.SKID_FL = this.updateCurrentSkidInfo(this.m_frontLeftWheel);
                if (this.SKID_FL < this.skidThreashold)
                    this.SKID_FL = 0;
                if (this.SKID_FL > 0 && wheelContactFL === true) {
                    const skidPosFL = this.m_frontLeftWheel.raycastResult.hitPointWorld;
                    const skidNormFL = this.m_frontLeftWheel.raycastResult.hitNormalWorld;
                    const skidScaleFL = BABYLON.Scalar.Normalize(this.SKID_FL, this.skidThreashold, 1.0);
                    if (this.wheelDrawVelocity > 0)
                        skidPosFL.addInPlace(this.m_velocityOffset);
                    this.m_frontLeftWheelSkid = PROJECT.SkidMarkManager.AddSkidMarkSegment(skidPosFL, skidNormFL, skidScaleFL, this.m_frontLeftWheelSkid);
                    if (this.frontLeftWheelParticle != null) {
                        if (this.frontLeftWheelParticle.isStarted() === false) {
                            this.frontLeftWheelParticle.start();
                        }
                        const smoke_FL = this.SKID_FL * this.SKID_FL;
                        this.frontLeftWheelParticle.emitRate = this.smokeIntensityFactor * smoke_FL;
                        this.frontLeftWheelParticle.minSize = 0.2 * smoke_FL + 0.2;
                        this.frontLeftWheelParticle.maxSize = 1.5 * smoke_FL + 1.2;
                    }
                }
                else {
                    if (this.frontLeftWheelParticle != null)
                        this.frontLeftWheelParticle.emitRate = 0;
                    this.m_frontLeftWheelSkid = -1;
                }
            }
            if (this.m_frontRightWheel != null) {
                const wheelContactFR = (this.m_frontRightWheel.raycastResult.body != null); // Check Is In Contact With Actual Ground Object - wheel.get_m_raycastInfo().get_m_groundObject() ???
                this.SKID_FR = this.updateCurrentSkidInfo(this.m_frontRightWheel);
                if (this.SKID_FR < this.skidThreashold)
                    this.SKID_FR = 0;
                if (this.SKID_FR > 0 && wheelContactFR === true) {
                    const skidPosFR = this.m_frontRightWheel.raycastResult.hitPointWorld;
                    const skidNormFR = this.m_frontRightWheel.raycastResult.hitNormalWorld;
                    const skidScaleFR = BABYLON.Scalar.Normalize(this.SKID_FR, this.skidThreashold, 1.0);
                    if (this.wheelDrawVelocity > 0)
                        skidPosFR.addInPlace(this.m_velocityOffset);
                    this.m_frontRightWheelSkid = PROJECT.SkidMarkManager.AddSkidMarkSegment(skidPosFR, skidNormFR, skidScaleFR, this.m_frontRightWheelSkid);
                    if (this.frontRightWheelParticle != null) {
                        if (this.frontRightWheelParticle.isStarted() === false) {
                            this.frontRightWheelParticle.start();
                        }
                        const smoke_FR = this.SKID_FR * this.SKID_FR;
                        this.frontRightWheelParticle.emitRate = this.smokeIntensityFactor * smoke_FR;
                        this.frontRightWheelParticle.minSize = 0.2 * smoke_FR + 0.2;
                        this.frontRightWheelParticle.maxSize = 1.5 * smoke_FR + 1.2;
                    }
                }
                else {
                    if (this.frontRightWheelParticle != null)
                        this.frontRightWheelParticle.emitRate = 0;
                    this.m_frontRightWheelSkid = -1;
                }
            }
            this.PITCH_FL = this.SKID_FL;
            this.PITCH_FR = this.SKID_FR;
            if (this.wheelBurnout == true || this.restoreTimer > 0) {
                this.PITCH_FL *= this.burnoutWheelPitch;
                this.PITCH_FR *= this.burnoutWheelPitch;
            }
            this.PITCH_FL *= 0.75; // 75% Skid For Front Wheels
            this.PITCH_FR *= 0.75; // 75% Skid For Front Wheels
            if (this.m_backLeftWheel != null) {
                const wheelContactBL = (this.m_backLeftWheel.raycastResult.body != null);
                this.SKID_RL = this.updateCurrentSkidInfo(this.m_backLeftWheel);
                if (this.SKID_RL < this.skidThreashold)
                    this.SKID_RL = 0;
                if (this.SKID_RL > 0 && wheelContactBL === true) {
                    const skidPosRL = this.m_backLeftWheel.raycastResult.hitPointWorld;
                    const skidNormRL = this.m_backLeftWheel.raycastResult.hitNormalWorld;
                    const skidScaleRL = BABYLON.Scalar.Normalize(this.SKID_RL, this.skidThreashold, 1.0);
                    if (this.wheelDrawVelocity > 0)
                        skidPosRL.addInPlace(this.m_velocityOffset);
                    this.m_backLeftWheelSkid = PROJECT.SkidMarkManager.AddSkidMarkSegment(skidPosRL, skidNormRL, skidScaleRL, this.m_backLeftWheelSkid);
                    if (this.backLeftWheelParticle != null) {
                        if (this.backLeftWheelParticle.isStarted() === false) {
                            this.backLeftWheelParticle.start();
                        }
                        const smoke_RL = this.SKID_RL * this.SKID_RL;
                        this.backLeftWheelParticle.emitRate = this.smokeIntensityFactor * smoke_RL;
                        this.backLeftWheelParticle.minSize = 0.2 * smoke_RL + 0.2;
                        this.backLeftWheelParticle.maxSize = 1.5 * smoke_RL + 1.2;
                    }
                }
                else {
                    if (this.backLeftWheelParticle != null)
                        this.backLeftWheelParticle.emitRate = 0;
                    this.m_backLeftWheelSkid = -1;
                }
            }
            if (this.m_backRightWheel != null) {
                const wheelContactBR = (this.m_backRightWheel.raycastResult.body != null);
                this.SKID_RR = this.updateCurrentSkidInfo(this.m_backRightWheel);
                if (this.SKID_RR < this.skidThreashold)
                    this.SKID_RR = 0;
                if (this.SKID_RR > 0 && wheelContactBR === true) {
                    const skidPosRR = this.m_backRightWheel.raycastResult.hitPointWorld;
                    const skidNormRR = this.m_backRightWheel.raycastResult.hitNormalWorld;
                    const skidScaleRR = BABYLON.Scalar.Normalize(this.SKID_RR, this.skidThreashold, 1.0);
                    if (this.wheelDrawVelocity > 0)
                        skidPosRR.addInPlace(this.m_velocityOffset);
                    this.m_backRightWheelSkid = PROJECT.SkidMarkManager.AddSkidMarkSegment(skidPosRR, skidNormRR, skidScaleRR, this.m_backRightWheelSkid);
                    if (this.backRightWheelParticle != null) {
                        if (this.backRightWheelParticle.isStarted() === false) {
                            this.backRightWheelParticle.start();
                        }
                        const smoke_RR = this.SKID_RR * this.SKID_RR;
                        this.backRightWheelParticle.emitRate = this.smokeIntensityFactor * smoke_RR;
                        this.backRightWheelParticle.minSize = 0.2 * smoke_RR + 0.2;
                        this.backRightWheelParticle.maxSize = 1.5 * smoke_RR + 1.2;
                    }
                }
                else {
                    if (this.backRightWheelParticle != null)
                        this.backRightWheelParticle.emitRate = 0;
                    this.m_backRightWheelSkid = -1;
                }
            }
            this.PITCH_RL = this.SKID_RL;
            this.PITCH_RR = this.SKID_RR;
            if (this.wheelBurnout == true || this.restoreTimer > 0) {
                this.PITCH_RL *= this.burnoutWheelPitch;
                this.PITCH_RR *= this.burnoutWheelPitch;
            }
            ///////////////////////////////////////////
            // Play Skid Audio Track
            ///////////////////////////////////////////
            this.WHEEL_SKID_PITCH = 0;
            if (this.PITCH_FL > this.WHEEL_SKID_PITCH)
                this.WHEEL_SKID_PITCH = this.PITCH_FL;
            if (this.PITCH_FR > this.WHEEL_SKID_PITCH)
                this.WHEEL_SKID_PITCH = this.PITCH_FR;
            if (this.PITCH_RL > this.WHEEL_SKID_PITCH)
                this.WHEEL_SKID_PITCH = this.PITCH_RL;
            if (this.PITCH_RR > this.WHEEL_SKID_PITCH)
                this.WHEEL_SKID_PITCH = this.PITCH_RR;
            if (this.playVehicleSounds === true) {
                if (this._skidAudioSource != null) {
                    const skidSoundClip = this._skidAudioSource.getSoundClip();
                    if (skidSoundClip != null)
                        skidSoundClip.setPlaybackRate(this.WHEEL_SKID_PITCH);
                }
            }
            ///////////////////////////////////////////
            // Vehicle Braking Lights Check
            ///////////////////////////////////////////
            if (this.brakeLightsMesh != null) {
                this.brakeLightsMesh.isVisible = (this.getFootBraking() || this.getHandBraking());
            }
            ///////////////////////////////////////////
            // Vehicle Reverse Lights Check
            ///////////////////////////////////////////
            if (this.reverseLightsMesh != null) {
                this.reverseLightsMesh.isVisible = this.getReverseThrottle();
            }
            ///////////////////////////////////////////
            // Reset Skid Properties
            ///////////////////////////////////////////
            if (this.SKID_FL === 0 && this.SKID_FL === 0 && this.SKID_FL === 0 && this.SKID_FL === 0) {
                this.smokeIntensityFactor = 0;
            }
            ///////////////////////////////////////////
            // Post Network Attributes
            ///////////////////////////////////////////
            if (this.postNetworkAttributes == true && UNITY.EntityController.HasNetworkEntity(this.transform)) {
                const pitch_Attribute = this.getEnginePitchLevel();
                const brake_Attribute = (this.getFootBraking() || this.getHandBraking()) ? 1 : 0;
                const reverse_Attribute = this.getReverseThrottle() ? 1 : 0;
                const burnout_Attribute = (this.getCurrentBurnout() || this.getCurrentDonuts()) ? 1 : 0;
                const SKID_FL_Attribute = this.getFrontLeftSkid();
                const SKID_FR_Attribute = this.getFrontRightSkid();
                const SKID_RL_Attribute = this.getBackLeftSkid();
                const SKID_RR_Attribute = this.getBackRightSkid();
                const SPIN_FL_Transform = this.m_frontLeftWheel.spinner;
                const SPIN_FR_Transform = this.m_frontRightWheel.spinner;
                const SPIN_RL_Transform = this.m_backLeftWheel.spinner;
                const SPIN_RR_Transform = this.m_backRightWheel.spinner;
                UNITY.EntityController.PostBufferedAttribute(this.transform, 0, pitch_Attribute); // Pitch
                UNITY.EntityController.PostBufferedAttribute(this.transform, 1, brake_Attribute); // Brake
                UNITY.EntityController.PostBufferedAttribute(this.transform, 2, reverse_Attribute); // Reverse
                UNITY.EntityController.PostBufferedAttribute(this.transform, 3, burnout_Attribute); // Burnout
                UNITY.EntityController.PostBufferedAttribute(this.transform, 4, SKID_FL_Attribute); // SKID_FL
                UNITY.EntityController.PostBufferedAttribute(this.transform, 5, SKID_FR_Attribute); // SKID_FR
                UNITY.EntityController.PostBufferedAttribute(this.transform, 6, SKID_RL_Attribute); // SKID_RL
                UNITY.EntityController.PostBufferedAttribute(this.transform, 7, SKID_RR_Attribute); // SKID_RR
                if (SPIN_FL_Transform != null && SPIN_FL_Transform.rotationQuaternion != null) {
                    SPIN_FL_Transform.rotationQuaternion.toEulerAnglesToRef(this.SPIN_FL_Rotation);
                    UNITY.EntityController.PostBufferedAttribute(this.transform, 8, this.SPIN_FL_Rotation.x); // SPIN_FL
                }
                else {
                    UNITY.EntityController.PostBufferedAttribute(this.transform, 8, 0);
                }
                if (SPIN_FR_Transform != null && SPIN_FR_Transform.rotationQuaternion != null) {
                    SPIN_FR_Transform.rotationQuaternion.toEulerAnglesToRef(this.SPIN_FR_Rotation);
                    UNITY.EntityController.PostBufferedAttribute(this.transform, 9, this.SPIN_FR_Rotation.x); // SPIN_FR
                }
                else {
                    UNITY.EntityController.PostBufferedAttribute(this.transform, 9, 0);
                }
                if (SPIN_RL_Transform != null && SPIN_RL_Transform.rotationQuaternion != null) {
                    SPIN_RL_Transform.rotationQuaternion.toEulerAnglesToRef(this.SPIN_RL_Rotation);
                    UNITY.EntityController.PostBufferedAttribute(this.transform, 10, this.SPIN_RL_Rotation.x); // SPIN_RL
                }
                else {
                    UNITY.EntityController.PostBufferedAttribute(this.transform, 10, 0);
                }
                if (SPIN_RR_Transform != null && SPIN_RR_Transform.rotationQuaternion != null) {
                    SPIN_RR_Transform.rotationQuaternion.toEulerAnglesToRef(this.SPIN_RR_Rotation);
                    UNITY.EntityController.PostBufferedAttribute(this.transform, 11, this.SPIN_RR_Rotation.x); // SPIN_RR
                }
                else {
                    UNITY.EntityController.PostBufferedAttribute(this.transform, 11, 0);
                }
                UNITY.EntityController.PostBufferedAttribute(this.transform, 12, this.animatorSteerAngle); // Steering
            }
            ///////////////////////////////////////////
            // Write Transform Metadata
            ///////////////////////////////////////////
            this.writeTransformMetadata();
        }
        writeTransformMetadata() {
            if (this.transform.metadata == null)
                this.transform.metadata = {};
            if (this.transform.metadata.car == null)
                this.transform.metadata.car = {};
            // ..
            // Update Transform Node Metadata
            // ..
            this.transform.metadata.car.forwardSpeed = this.forwardSpeed;
            this.transform.metadata.car.reversePower = this.maxReversePower;
            this.transform.metadata.car.americanSpeed = this.americanSpeed;
            this.transform.metadata.car.gradientSpeed = this.gradientSpeed;
            this.transform.metadata.car.currentForward = this.currentForward;
            this.transform.metadata.car.linearVelocity = this.getLinearVelocity().length();
            this.transform.metadata.car.normalizedSpeed = this.getNormalizedSpeed();
        }
        getVehicleEngineTorque(rpm, boost = 0) {
            let result = 0;
            if (this.engineTorqueCurve != null) {
                result = (UNITY.Utilities.SampleAnimationFloat(this.engineTorqueCurve, BABYLON.Scalar.Clamp(rpm, this.MIN_RPM, this.MAX_RPM), BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE, false) * (this.powerCoefficient + boost));
            }
            return result;
        }
        createSmokeParticleSystem(name, emitter) {
            const result = new BABYLON.ParticleSystem(name, 10000, this.scene);
            result.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
            result.renderingGroupId = UNITY.Utilities.DefaultRenderGroup();
            result.particleTexture = this.smokeTexture;
            result.emitter = emitter;
            result.emitRate = 0;
            result.updateSpeed = 0.01;
            // change size and speed
            result.minSize = 0.2;
            result.maxSize = 1.3;
            result.minAngularSpeed = -1.5;
            result.maxAngularSpeed = 1.5;
            // changed lifetime to control shape of the cloud in conjunction with velocity gradient
            result.minLifeTime = 3.0;
            result.maxLifeTime = 5.0;
            // adding velocity over time to prevent large bloom of particles by launching them fast and then slowing them down GPU particles don't take a gradient on velocity, but the reduction in velocity over time is worth the trade off for less randomization
            result.addVelocityGradient(0, 1);
            result.addVelocityGradient(0.1, 0.7);
            result.addVelocityGradient(0.7, 0.2);
            result.addVelocityGradient(1.0, 0.05);
            // reduced the emit rate to reduce bloom of particles in the center of mass
            result.gravity = new BABYLON.Vector3(0, -0.1, 0);
            result.minEmitBox = new BABYLON.Vector3(0, -0.25, 0);
            result.maxEmitBox = new BABYLON.Vector3(0, -0.25, 0);
            result.direction1 = new BABYLON.Vector3(-1, -1, -1);
            result.direction2 = new BABYLON.Vector3(1, 1, 1);
            // The color1, color2, colorDead pattern is overridden by color gradient so is unnecessary
            result.color1 = new BABYLON.Color4(0.95, 0.95, 0.95, this.smokeOpacity);
            result.color2 = new BABYLON.Color4(0.85, 0.85, 0.85, this.smokeOpacity);
            result.colorDead = new BABYLON.Color4(0.9, 0.9, 0.9, (this.smokeOpacity * 0.5));
            // Changed the color gradient to add a second value for randomization and ramped the color down further to create more texture with alpha blending
            //result.addColorGradient(0.0, new BABYLON.Color4(1, 1, 1, 0.0), new BABYLON.Color4(0.7, 0.7, 0.7, 0.0));
            //result.addColorGradient(0.2, new BABYLON.Color4(0.7, 0.7, 0.7, 0.2), new BABYLON.Color4(0.6, 0.6, 0.6, 0.2));
            //result.addColorGradient(0.6, new BABYLON.Color4(0.6, 0.6, 0.6, 0.1),new BABYLON.Color4(0.4, 0.4, 0.4, 0.1));
            //result.addColorGradient(1.0, new BABYLON.Color4(0.3, 0.3, 0.3, 0.0),new BABYLON.Color4(0.1, 0.1, 0.1, 0.0));            
            return result;
        }
        updateCurrentSkidInfo(wheel) {
            return BABYLON.Scalar.Clamp((1 - wheel.skidInfo));
        }
        updateCurrentBrakeDamping(linear, angular, lerp = 1.0) {
            let totalWheelDampener = 0;
            let destinationLinearDamping = (linear + totalWheelDampener);
            let destinationAngularDamping = angular;
            if (this.americanSpeed >= this.minPenaltySpeed && this.linearWheelDrag > 0) {
                if (this.frontLeftContactTag === this.penaltyGroundTag)
                    totalWheelDampener += this.linearWheelDrag;
                if (this.frontRightContactTag === this.penaltyGroundTag)
                    totalWheelDampener += this.linearWheelDrag;
                if (this.rearLeftContactTag === this.penaltyGroundTag)
                    totalWheelDampener += this.linearWheelDrag;
                if (this.rearRightContactTag === this.penaltyGroundTag)
                    totalWheelDampener += this.linearWheelDrag;
            }
            if (lerp < 1.0) {
                let currentLinearDamping = this.transform.physicsBody.getLinearDamping();
                let currentAngularDamping = this.transform.physicsBody.getAngularDamping();
                let smoothedLinearDamping = BABYLON.Scalar.Lerp(currentLinearDamping, destinationLinearDamping, lerp);
                let smoothedAngularDamping = BABYLON.Scalar.Lerp(currentAngularDamping, destinationAngularDamping, lerp);
                this.transform.physicsBody.setLinearDamping(smoothedLinearDamping);
                this.transform.physicsBody.setAngularDamping(smoothedAngularDamping);
            }
            else {
                this.transform.physicsBody.setLinearDamping(destinationLinearDamping);
                this.transform.physicsBody.setAngularDamping(destinationAngularDamping);
            }
        }
        updateLinearBrakeDamping(linear, lerp = 1.0) {
            let totalWheelDampener = 0;
            let destinationLinearDamping = (linear + totalWheelDampener);
            if (this.americanSpeed >= this.minPenaltySpeed && this.linearWheelDrag > 0) {
                if (this.frontLeftContactTag === this.penaltyGroundTag)
                    totalWheelDampener += this.linearWheelDrag;
                if (this.frontRightContactTag === this.penaltyGroundTag)
                    totalWheelDampener += this.linearWheelDrag;
                if (this.rearLeftContactTag === this.penaltyGroundTag)
                    totalWheelDampener += this.linearWheelDrag;
                if (this.rearRightContactTag === this.penaltyGroundTag)
                    totalWheelDampener += this.linearWheelDrag;
            }
            if (lerp < 1.0) {
                let currentLinearDamping = this.transform.physicsBody.getLinearDamping();
                let smoothedLinearDamping = BABYLON.Scalar.Lerp(currentLinearDamping, destinationLinearDamping, lerp);
                this.transform.physicsBody.setLinearDamping(smoothedLinearDamping);
            }
            else {
                this.transform.physicsBody.setLinearDamping(destinationLinearDamping);
            }
        }
        updateAngularBrakeDamping(angular, lerp = 1.0) {
            let totalWheelDampener = 0;
            let destinationAngularDamping = angular;
            if (this.americanSpeed >= this.minPenaltySpeed && this.linearWheelDrag > 0) {
                if (this.frontLeftContactTag === this.penaltyGroundTag)
                    totalWheelDampener += this.linearWheelDrag;
                if (this.frontRightContactTag === this.penaltyGroundTag)
                    totalWheelDampener += this.linearWheelDrag;
                if (this.rearLeftContactTag === this.penaltyGroundTag)
                    totalWheelDampener += this.linearWheelDrag;
                if (this.rearRightContactTag === this.penaltyGroundTag)
                    totalWheelDampener += this.linearWheelDrag;
            }
            if (lerp < 1.0) {
                let currentAngularDamping = this.transform.physicsBody.getAngularDamping();
                let smoothedAngularDamping = BABYLON.Scalar.Lerp(currentAngularDamping, destinationAngularDamping, lerp);
                this.transform.physicsBody.setAngularDamping(smoothedAngularDamping);
            }
            else {
                this.transform.physicsBody.setAngularDamping(destinationAngularDamping);
            }
        }
        updateCurrentRotationDelta(delta) {
            if (this.m_frontLeftWheel != null)
                this.m_frontLeftWheel.deltaRotation = delta;
            if (this.m_frontRightWheel != null)
                this.m_frontRightWheel.deltaRotation = delta;
            if (this.m_backLeftWheel != null)
                this.m_backLeftWheel.deltaRotation = delta;
            if (this.m_backRightWheel != null)
                this.m_backRightWheel.deltaRotation = delta;
        }
        updateCurrentRotationBoost(boost) {
            if (this.wheelDriveType === 1 || this.wheelDriveType === 2) { // FRONT OR ALL WHEEL DRIVE
                if (this.m_frontLeftWheel != null)
                    this.m_frontLeftWheel.rotationBoost = boost;
                if (this.m_frontRightWheel != null)
                    this.m_frontRightWheel.rotationBoost = boost;
            }
            if (this.wheelDriveType === 0 || this.wheelDriveType === 2) { // REAR OR ALL WHEEL DRIVE
                if (this.m_backLeftWheel != null)
                    this.m_backLeftWheel.rotationBoost = boost;
                if (this.m_backRightWheel != null)
                    this.m_backRightWheel.rotationBoost = boost;
            }
        }
        updateCurrentFrictionSlip(lerpSpeed) {
            if (this.m_frontLeftWheel != null && this.m_frontLeftWheel.defaultFriction != null) {
                let frontLeftFriction = this.m_frontLeftWheel.frictionSlip;
                if (frontLeftFriction < (this.m_frontLeftWheel.defaultFriction - 0.1)) {
                    this.frontLeftFrictionLerping = true;
                    frontLeftFriction = BABYLON.Scalar.Lerp(frontLeftFriction, this.m_frontLeftWheel.defaultFriction, (this.frontLeftFrictionPenalty === true) ? (lerpSpeed * 3.0) : lerpSpeed);
                    this.m_frontLeftWheel.frictionSlip = frontLeftFriction;
                }
                else {
                    this.frontLeftFrictionPenalty = false;
                    this.frontLeftFrictionLerping = false;
                    this.m_frontLeftWheel.frictionSlip = this.m_frontLeftWheel.defaultFriction;
                }
            }
            if (this.m_frontRightWheel != null && this.m_frontRightWheel.defaultFriction != null) {
                let frontRightFriction = this.m_frontRightWheel.frictionSlip;
                if (frontRightFriction < (this.m_frontRightWheel.defaultFriction - 0.1)) {
                    this.frontRightFrictionLerping = true;
                    frontRightFriction = BABYLON.Scalar.Lerp(frontRightFriction, this.m_frontRightWheel.defaultFriction, (this.frontRightFrictionPenalty === true) ? (lerpSpeed * 3.0) : lerpSpeed);
                    this.m_frontRightWheel.frictionSlip = frontRightFriction;
                }
                else {
                    this.frontRightFrictionPenalty = false;
                    this.frontRightFrictionLerping = false;
                    this.m_frontRightWheel.frictionSlip = this.m_frontRightWheel.defaultFriction;
                }
            }
            if (this.m_backLeftWheel != null && this.m_backLeftWheel.defaultFriction != null) {
                let backLeftFriction = this.m_backLeftWheel.frictionSlip;
                if (backLeftFriction < (this.m_backLeftWheel.defaultFriction - 0.1)) {
                    this.rearLeftFrictionLerping = true;
                    backLeftFriction = BABYLON.Scalar.Lerp(backLeftFriction, this.m_backLeftWheel.defaultFriction, (this.rearLeftFrictionPenalty === true) ? (lerpSpeed * 3.0) : lerpSpeed);
                    this.m_backLeftWheel.frictionSlip = backLeftFriction;
                }
                else {
                    this.rearLeftFrictionPenalty = false;
                    this.rearLeftFrictionLerping = false;
                    this.m_backLeftWheel.frictionSlip = this.m_backLeftWheel.defaultFriction;
                }
            }
            if (this.m_backRightWheel != null && this.m_backRightWheel.defaultFriction != null) {
                let backRightFriction = this.m_backRightWheel.frictionSlip;
                if (backRightFriction < (this.m_backRightWheel.defaultFriction - 0.1)) {
                    backRightFriction = BABYLON.Scalar.Lerp(backRightFriction, this.m_backRightWheel.defaultFriction, (this.rearRightFrictionPenalty === true) ? (lerpSpeed * 3.0) : lerpSpeed);
                    this.m_backRightWheel.frictionSlip = backRightFriction;
                }
                else {
                    this.rearRightFrictionPenalty = false;
                    this.rearRightFrictionLerping = false;
                    this.m_backRightWheel.frictionSlip = this.m_backRightWheel.defaultFriction;
                }
            }
        }
        getFrontLeftWheelContact() { return this.frontLeftContact; }
        getFrontRightWheelContact() { return this.frontRightContact; }
        getRearLeftWheelContact() { return this.rearLeftContact; }
        getRearRightWheelContact() { return this.rearRightContact; }
        getFrontLeftWheelContactTag() { return this.frontLeftContactTag; }
        getFrontRightWheelContactTag() { return this.frontRightContactTag; }
        getRearLeftWheelContactTag() { return this.rearLeftContactTag; }
        getRearRightWheelContactTag() { return this.rearRightContactTag; }
        getFrontLeftWheelContactPoint() { return this.frontLeftContactPoint; }
        getFrontRightWheelContactPoint() { return this.frontRightContactPoint; }
        getRearLeftWheelContactPoint() { return this.rearLeftContactPoint; }
        getRearRightWheelContactPoint() { return this.rearRightContactPoint; }
        getFrontLeftWheelContactNormal() { return this.frontLeftContactNormal; }
        getFrontRightWheelContactNormal() { return this.frontRightContactNormal; }
        getRearLeftWheelContactNormal() { return this.rearLeftContactNormal; }
        getRearRightWheelContactNormal() { return this.rearRightContactNormal; }
        castWheelContactRays() {
            if (this.transform.physicsBody == null)
                return;
            let raycast = null;
            this.frontLeftContact = false;
            this.frontRightContact = false;
            this.rearLeftContact = false;
            this.rearRightContact = false;
            this.frontLeftContactTag = "";
            this.frontRightContactTag = "";
            this.rearLeftContactTag = "";
            this.rearRightContactTag = "";
            this.frontLeftContactPoint.set(0, 0, 0);
            this.frontRightContactPoint.set(0, 0, 0);
            this.rearLeftContactPoint.set(0, 0, 0);
            this.rearRightContactPoint.set(0, 0, 0);
            this.frontLeftContactNormal.set(0, 0, 0);
            this.frontRightContactNormal.set(0, 0, 0);
            this.rearLeftContactNormal.set(0, 0, 0);
            this.rearRightContactNormal.set(0, 0, 0);
            // ..
            // Front Left Raycast Positions
            // ..
            UNITY.Utilities.GetAbsolutePositionToRef(this.frontLeftWheelMesh, this.startRaycastPosition);
            UNITY.Utilities.GetAbsolutePositionToRef(this.frontLeftWheelMesh, this.endRaycastPosition, this.downDirection.scale(this.downDistance));
            this.startRaycastPosition.addInPlace(this.m_velocityOffset);
            this.endRaycastPosition.addInPlace(this.m_velocityOffset);
            // Front Left Physics Raycast
            // FIXME: raycast = UNITY.RigidbodyPhysics.PhysicsRaycast(this.scene, this.startRaycastPosition, this.downDirection, this.downDistance);
            if (raycast != null && raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                this.frontLeftContact = true;
                this.frontLeftContactTag = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                this.frontLeftContactPoint.copyFrom(raycast.hitPoint);
                this.frontLeftContactNormal.copyFrom(raycast.hitNormal);
            }
            // Front Left Draw Debug Lines
            if (this.showSensorLines === true) {
                if (this.frontLeftSensorLine == null)
                    this.frontLeftSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".FrontLeftSensorLine", this.scene);
                if (this.frontLeftContact === true) {
                    this.frontLeftSensorLine.drawLine([this.startRaycastPosition, raycast.hitPoint], BABYLON.Color3.Yellow());
                }
                else {
                    this.frontLeftSensorLine.drawLine([this.startRaycastPosition, this.endRaycastPosition], BABYLON.Color3.Blue());
                }
            }
            // ..
            // Front Right Raycast Positions
            // ..
            UNITY.Utilities.GetAbsolutePositionToRef(this.frontRightWheelMesh, this.startRaycastPosition);
            UNITY.Utilities.GetAbsolutePositionToRef(this.frontRightWheelMesh, this.endRaycastPosition, this.downDirection.scale(this.downDistance));
            this.startRaycastPosition.addInPlace(this.m_velocityOffset);
            this.endRaycastPosition.addInPlace(this.m_velocityOffset);
            // Front Right Physics Raycast
            // FIXME: raycast = UNITY.RigidbodyPhysics.PhysicsRaycast(this.scene, this.startRaycastPosition, this.downDirection, this.downDistance);
            if (raycast != null && raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                this.frontRightContact = true;
                this.frontRightContactTag = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                this.frontRightContactPoint.copyFrom(raycast.hitPoint);
                this.frontRightContactNormal.copyFrom(raycast.hitNormal);
            }
            // Front Right Draw Debug Lines
            if (this.showSensorLines === true) {
                if (this.frontRightSensorLine == null)
                    this.frontRightSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".FrontRightSensorLine", this.scene);
                if (this.frontRightContact === true) {
                    this.frontRightSensorLine.drawLine([this.startRaycastPosition, raycast.hitPoint], BABYLON.Color3.Yellow());
                }
                else {
                    this.frontRightSensorLine.drawLine([this.startRaycastPosition, this.endRaycastPosition], BABYLON.Color3.Blue());
                }
            }
            // ..
            // Rear Left Raycast Positions
            // ..
            UNITY.Utilities.GetAbsolutePositionToRef(this.backLeftWheelMesh, this.startRaycastPosition);
            UNITY.Utilities.GetAbsolutePositionToRef(this.backLeftWheelMesh, this.endRaycastPosition, this.downDirection.scale(this.downDistance));
            this.startRaycastPosition.addInPlace(this.m_velocityOffset);
            this.endRaycastPosition.addInPlace(this.m_velocityOffset);
            // Rear Left Physics Raycast
            // FIXME: raycast = UNITY.RigidbodyPhysics.PhysicsRaycast(this.scene, this.startRaycastPosition, this.downDirection, this.downDistance);
            if (raycast != null && raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                this.rearLeftContact = true;
                this.rearLeftContactTag = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                this.rearLeftContactPoint.copyFrom(raycast.hitPoint);
                this.rearLeftContactNormal.copyFrom(raycast.hitNormal);
            }
            // Rear Left Draw Debug Lines
            if (this.showSensorLines === true) {
                if (this.rearLeftSensorLine == null)
                    this.rearLeftSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".RearLeftSensorLine", this.scene);
                if (this.rearLeftContact === true) {
                    this.rearLeftSensorLine.drawLine([this.startRaycastPosition, raycast.hitPoint], BABYLON.Color3.Yellow());
                }
                else {
                    this.rearLeftSensorLine.drawLine([this.startRaycastPosition, this.endRaycastPosition], BABYLON.Color3.Blue());
                }
            }
            // ..
            // Rear Right Raycast Positions
            // ..
            UNITY.Utilities.GetAbsolutePositionToRef(this.backRightWheelMesh, this.startRaycastPosition);
            UNITY.Utilities.GetAbsolutePositionToRef(this.backRightWheelMesh, this.endRaycastPosition, this.downDirection.scale(this.downDistance));
            this.startRaycastPosition.addInPlace(this.m_velocityOffset);
            this.endRaycastPosition.addInPlace(this.m_velocityOffset);
            // Rear Right Physics Raycast
            // FIXME: raycast = UNITY.RigidbodyPhysics.PhysicsRaycast(this.scene, this.startRaycastPosition, this.downDirection, this.downDistance);
            if (raycast != null && raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                this.rearRightContact = true;
                this.rearRightContactTag = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                this.rearRightContactPoint.copyFrom(raycast.hitPoint);
                this.rearRightContactNormal.copyFrom(raycast.hitNormal);
            }
            // Rear Right Draw Debug Lines
            if (this.showSensorLines === true) {
                if (this.rearRightSensorLine == null)
                    this.rearRightSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".RearRightSensorLine", this.scene);
                if (this.rearRightContact === true) {
                    this.rearRightSensorLine.drawLine([this.startRaycastPosition, raycast.hitPoint], BABYLON.Color3.Yellow());
                }
                else {
                    this.rearRightSensorLine.drawLine([this.startRaycastPosition, this.endRaycastPosition], BABYLON.Color3.Blue());
                }
            }
        }
    }
    StandardCarController.DEFAULT_SPEED_FACTOR = 1.0;
    StandardCarController.DEFAULT_PITCH_FACTOR = 1.0;
    PROJECT.StandardCarController = StandardCarController;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class VehicleCameraManager
    */
    class VehicleCameraManager extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.enableCamera = false;
            this.followTarget = false;
            this.followHeight = 1.25;
            this.pitchingAngle = 0.0;
            this.rotationDamping = 5.0;
            this.minimumDistance = 4.0;
            this.maximumDistance = 5.0;
            this.buttonCamera = BABYLON.Xbox360Button.Y;
            this.keyboardCamera = UNITY.UserInputKey.P;
            this.tickRemoteEntities = false;
            this.firstPerson = false;
            this.cameraPivot = null;
            this.targetEulers = BABYLON.Vector3.Zero();
            this.cameraRotation = BABYLON.Quaternion.Zero();
            this.cameraPivotOffset = BABYLON.Vector3.Zero();
            this.autoAttachCamera = false;
            this.m_cameraTransform = null;
            this.m_inputController = null;
            this.m_standardController = null;
            this.m_firstPersonOffset = new BABYLON.Vector3(0.0, 1.15, 0.15);
        }
        awake() { this.awakeCameraManager(); }
        start() { this.initCameraManager(); }
        late() { this.lateUpdateCameraManager(); }
        destroy() { this.destroyCameraManager(); }
        awakeCameraManager() {
            this.enableCamera = this.getProperty("enableCamera", this.enableCamera);
            this.followTarget = this.getProperty("followTarget", this.followTarget);
            this.followHeight = this.getProperty("followHeight", this.followHeight);
            this.pitchingAngle = this.getProperty("pitchingAngle", this.pitchingAngle);
            this.rotationDamping = this.getProperty("rotationDamping", this.rotationDamping);
            this.minimumDistance = this.getProperty("minimumDistance", this.minimumDistance);
            this.maximumDistance = this.getProperty("maximumDistance", this.maximumDistance);
            this.autoAttachCamera = this.getProperty("attachCamera", this.autoAttachCamera);
            this.tickRemoteEntities = this.getProperty("tickRemoteEntities", this.tickRemoteEntities);
            // ..
            const firstPersonOffset = this.getProperty("firstPersonOffset");
            if (firstPersonOffset != null)
                this.m_firstPersonOffset = UNITY.Utilities.ParseVector3(firstPersonOffset);
            if (this.rotationDamping <= 0)
                this.rotationDamping = 1;
        }
        initCameraManager() {
            this.m_standardController = this.getComponent("PROJECT.StandardCarController");
            this.m_inputController = this.getComponent("PROJECT.VehicleInputController");
            if (this.m_inputController != null) {
                UNITY.InputController.OnKeyboardPress(this.keyboardCamera, () => {
                    //if (this.playerNumber === UNITY.PlayerNumber.One) {
                    this.togglePlayerCamera();
                    //}
                });
                UNITY.InputController.OnGamepadButtonPress(this.buttonCamera, () => {
                    this.togglePlayerCamera();
                } /*, this.playerNumber*/);
            }
        }
        lateUpdateCameraManager() {
            if (this.m_cameraTransform == null && this.autoAttachCamera === true) {
                if (this.m_inputController != null)
                    this.attachPlayerCamera(this.m_inputController.playerNumber);
            }
            if (this.firstPerson === true) {
                this.firstPersonCamera();
            }
            else {
                this.thirdPersonCamera();
            }
        }
        destroyCameraManager() {
            this.m_standardController = null;
            this.m_cameraTransform = null;
        }
        //////////////////////////////////////////////////
        // Player Camera Functions //
        //////////////////////////////////////////////////
        attachPlayerCamera(player) {
            if (this.m_cameraTransform == null) {
                const playerCamera = (player <= 0 || player > 4) ? 1 : player;
                this.m_cameraTransform = PROJECT.DefaultCameraSystem.GetCameraTransform(this.scene, playerCamera);
                if (this.m_cameraTransform != null && this.followTarget === true) {
                    if (this.cameraPivot == null) {
                        this.cameraPivot = new BABYLON.TransformNode(this.transform.name + ".CameraPivot", this.scene);
                        this.cameraPivot.parent = null;
                        this.cameraPivot.position = this.transform.position.clone();
                        this.cameraPivot.rotationQuaternion = this.transform.rotationQuaternion.clone();
                        // ..
                        // DEBUG: const testPivot:BABYLON.Mesh = BABYLON.Mesh.CreateBox("TestPivot", 0.25, this.scene);
                        // DEBUG: testPivot.parent = this.cameraPivot;
                        // DEBUG: testPivot.position.set(0,0,0);
                        // DEBUG: testPivot.rotationQuaternion = new BABYLON.Quaternion(0,0,0,1);
                    }
                    this.m_cameraTransform.parent = this.cameraPivot;
                    this.m_cameraTransform.position.set(0, 0, 0);
                    this.m_cameraTransform.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                }
            }
        }
        togglePlayerCamera() {
            this.firstPerson = !this.firstPerson;
        }
        firstPersonCamera() {
            if (this.enableCamera === true && this.m_cameraTransform != null && this.m_standardController != null) {
                if (this.followTarget === true) {
                    if (this.cameraPivot != null) {
                        // ..
                        // Update Position
                        // ..
                        UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.cameraPivot.position);
                        // ..
                        // Update Rotation
                        // ..
                        this.cameraPivot.rotationQuaternion.copyFrom(this.transform.rotationQuaternion);
                        // ..
                        // Update Camera Boom
                        // ..
                        this.m_cameraTransform.position.copyFrom(this.m_firstPersonOffset);
                        UNITY.Utilities.FromEulerToRef(0, 0, 0, this.m_cameraTransform.rotationQuaternion);
                    }
                }
                else {
                    this.m_cameraTransform.lookAt(this.transform.position);
                }
            }
        }
        // DEPRECIATED: private smoothDeltaTime:number = 0.0;
        thirdPersonCamera() {
            if (this.enableCamera === true && this.m_cameraTransform != null && this.m_standardController != null) {
                if (this.followTarget === true) {
                    if (this.cameraPivot != null) {
                        const deltaTime = this.getDeltaSeconds();
                        // KEEP FOR REFERECNE
                        // DEPRECIATED: const deltaFactor:number = UNITY.System.SmoothDeltaFactor;
                        // DEPRECIATED: this.smoothDeltaTime = deltaFactor * deltaTime + (1 - deltaFactor) * this.smoothDeltaTime;
                        // DEPRECIATED: const turnDampener:number = (this.smoothDeltaTime * this.rotationDamping);
                        // ..
                        // Update Position
                        // ..
                        this.cameraPivotOffset.set(0, this.followHeight, 0);
                        UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.cameraPivot.position, this.cameraPivotOffset);
                        // ..
                        // Update Rotation
                        // ..
                        const turnDampener = (deltaTime * this.rotationDamping);
                        this.transform.rotationQuaternion.toEulerAnglesToRef(this.targetEulers);
                        BABYLON.Quaternion.FromEulerAnglesToRef((this.targetEulers.x + BABYLON.Tools.ToRadians(this.pitchingAngle)), this.targetEulers.y, 0, this.cameraRotation);
                        BABYLON.Quaternion.SlerpToRef(this.cameraPivot.rotationQuaternion, this.cameraRotation, turnDampener, this.cameraPivot.rotationQuaternion);
                        // ..
                        // Update Camera Boom
                        // ..
                        const cameraBoomDistance = BABYLON.Scalar.Lerp(this.minimumDistance, this.maximumDistance, this.m_standardController.getGradientSpeed());
                        this.m_cameraTransform.position.set(0, 0, -cameraBoomDistance);
                    }
                }
                else {
                    this.m_cameraTransform.lookAt(this.transform.position);
                }
            }
        }
    }
    PROJECT.VehicleCameraManager = VehicleCameraManager;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    class VehicleInputController extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.playerDeltaX = 0;
            this.playerDeltaY = 0;
            this.playerMouseX = 0;
            this.playerMouseY = 0;
            this.ackermanRadius = 0.85;
            this.recoveryRadius = 0.25;
            this.waypointPosition = BABYLON.Vector3.Zero();
            this.waypointCount = 0;
            this.waypointIndex = 0;
            this.noMovementTime = 0;
            this.reverseFixMode = false;
            this.recoveryFixMode = false;
            this.nextTargetSpeed = 0;
            this.prevTargetSpeed = 0;
            this.vehicleResetCheck = 0;
            this.randomSkillFactor = 0;
            this.showChaseRabbit = false;
            this.showSensorLines = false;
            this.steeringWheelMode = -1;
            this.rabbitTrackerLine = null;
            this.rabbitTrackerColor = new BABYLON.Color3(1, 1, 1);
            this.greenTrackingColor = new BABYLON.Color3(0, 1, 0);
            this.redTrackingColor = new BABYLON.Color3(1, 0, 0);
            this.localTargetPosition = new BABYLON.Vector3(0, 0, 0);
            this.avoidPositionOffset = new BABYLON.Vector3(0, 0, 0);
            this.avoidanceLerp = 0;
            this.avoidanceTimer = 0;
            this.avoidanceValue = 0;
            this.randomTurning = 0;
            this.randomBoosting = 0;
            this.randomDistance = 0;
            this.lastCheckpoint = -1;
            this.mainCenterSensorLine = null;
            this.mainRightSensorLine = null;
            this.mainLeftSensorLine = null;
            this.angleRightSensorLine = null;
            this.angleLeftSensorLine = null;
            this.sideRightSensorLine = null;
            this.sideLeftSensorLine = null;
            this.backRightSensorLine = null;
            this.backLeftSensorLine = null;
            this.sidewaysOffsetVector = BABYLON.Vector3.Zero();
            this.backBumperEdgeVector = BABYLON.Vector3.Zero();
            this.sensorStartPos = BABYLON.Vector3.Zero();
            this.sensorPointPos = BABYLON.Vector3.Zero();
            this.sensorAnglePos = BABYLON.Vector3.Zero();
            this.rsideStartPos = BABYLON.Vector3.Zero();
            this.rsidePointPos = BABYLON.Vector3.Zero();
            this.lsideStartPos = BABYLON.Vector3.Zero();
            this.lsidePointPos = BABYLON.Vector3.Zero();
            this.tempScaleVector = BABYLON.Vector3.Zero();
            this.rbackStartPos = BABYLON.Vector3.Zero();
            this.rbackPointPos = BABYLON.Vector3.Zero();
            this.lbackStartPos = BABYLON.Vector3.Zero();
            this.lbackPointPos = BABYLON.Vector3.Zero();
            this.trackVehiclePosition = BABYLON.Vector3.Zero();
            this.trackRabbitPosition = BABYLON.Vector3.Zero();
            this.enableInput = false;
            this.resetTiming = 3.0;
            this.playerNumber = UNITY.PlayerNumber.One;
            this.pedelForward = 7; // Generic Button 7 (Foot Pedal)
            this.triggerForward = UNITY.Xbox360Trigger.Right;
            this.keyboardForawrd = UNITY.UserInputKey.W;
            this.auxKeyboardForawrd = UNITY.UserInputKey.UpArrow;
            this.pedalBackward = 6; // Generic Button 6 (Foot Pedal)
            this.triggerBackwards = UNITY.Xbox360Trigger.Left;
            this.keyboardBackwards = UNITY.UserInputKey.S;
            this.auxKeyboardBackwards = UNITY.UserInputKey.DownArrow;
            this.buttonHandbrake = BABYLON.Xbox360Button.X;
            this.keyboardHandbrake = UNITY.UserInputKey.SpaceBar;
            this.leftWheelHandbrake = 4; // Generic Button 4 (Hand Paddle)
            this.rightWheelHandbrake = 5; // Generic Button 5 (Hand Paddle)
            this.buttonDonut = BABYLON.Xbox360Button.B;
            this.keyboardDonut = UNITY.UserInputKey.Shift;
            this.leftWheelDonut = 10; // Generic Button 10 (Wheel Button)
            this.rightWheelDonut = 11; // Generic Button 11 (Wheel Button)
            // Auto Pilot Properties
            this.raceLineNode = 0;
            this.minLookAhead = 5;
            this.maxLookAhead = 50;
            this.driverSkillLevel = 1;
            this.chaseRabbitSpeed = 1.0;
            this.throttleSensitivity = 1;
            this.steeringSensitivity = 1;
            this.brakingSensitivity = 1;
            this.brakingTurnAngle = 15;
            this.brakingSpeedLimit = 90;
            this.skiddingSpeedLimit = 100;
            this.linearDampenForce = 0.1;
            this.driveSpeedMultiplier = 5.0;
            this.driveLineDistance = 1.0;
            this.resetMovingTimeout = 3;
            this.reverseThrottleTime = 3;
            this.maxRaceTrackSpeed = 0;
            this.trackManagerIdentity = "TrackManager";
            // Auto Pilot Avoid Sensors
            this.vehicleTag = "Vehicle";
            this.obstacleTag = "Obstacle";
            this.sensorLength = 8;
            this.spacerWidths = 0.85;
            this.angleFactors = 1.5;
            this.initialOffsetX = 1;
            this.initialOffsetY = 0.5;
            this.initialOffsetZ = 2;
            this.sidewaysLength = 1.5;
            this.sidewaysOffset = 0.5;
            this.backBumperEdge = 2.5;
            this.powerBoosting = 0.5;
            this.wonderDistance = 1.0;
            this.avoidanceFactor = 0.5;
            this.avoidanceSpeed = 3.0;
            this.avoidanceTimeout = 3.0;
            this.avoidanceDistance = 2.0;
            // Auto Pilot Reverse Options
            this.reversingFlag = false;
            this.reversingTime = 0.0;
            this.reversingWait = 2.0;
            this.reversingFor = 1.5;
            // Vehicle Drive Properties
            this.m_chasePointMesh = null;
            this.m_chaseRabbitMesh = null;
            this.m_circuitInterfaces = null;
            this.m_circuitRaceLine_1 = null;
            this.m_circuitRaceLine_2 = null;
            this.m_circuitRaceLine_3 = null;
            this.m_circuitRaceLine_4 = null;
            this.m_circuitRaceLine_5 = null;
            this.m_rigidbodyPhysics = null;
            this.m_checkpointManager = null;
            this.m_standardCarController = null;
        }
        // Public Properties
        getPlayerDeltaX() { return this.playerDeltaX; }
        ;
        getPlayerDeltaY() { return this.playerDeltaY; }
        ;
        getPlayerMouseX() { return this.playerMouseX; }
        ;
        getPlayerMouseY() { return this.playerMouseY; }
        ;
        getWaypointIndex() { return this.waypointIndex; }
        ;
        getChaseRabbitMesh() { return this.m_chaseRabbitMesh; }
        ;
        resetChaseRabbitMesh() {
            if (this.m_chaseRabbitMesh != null) {
                this.m_chaseRabbitMesh.position = this.transform.position.clone();
                this.m_chaseRabbitMesh.rotationQuaternion = this.transform.rotationQuaternion.clone();
            }
        }
        getChasePointMesh() { return this.m_chasePointMesh; }
        ;
        resetChasePointMesh() {
            if (this.m_chasePointMesh != null) {
                this.m_chasePointMesh.position = this.transform.position.clone();
                this.m_chasePointMesh.rotationQuaternion = this.transform.rotationQuaternion.clone();
            }
        }
        awake() { this.awakeVehicleController(); }
        start() { this.initVehicleController(); }
        update() { this.updateVehicleController(); }
        destroy() { this.destroyVehicleController(); }
        //////////////////////////////////////////////////
        // Protected Character Movement State Functions //
        //////////////////////////////////////////////////
        awakeVehicleController() {
            this.enableInput = this.getProperty("enableInput", this.enableInput);
            this.resetTiming = this.getProperty("resetTiming", this.resetTiming);
            this.playerNumber = this.getProperty("playerNumber", this.playerNumber);
            this.ackermanRadius = this.getProperty("ackermanRadius", this.ackermanRadius);
            this.recoveryRadius = this.getProperty("recoveryRadius", this.recoveryRadius);
            this.showChaseRabbit = this.getProperty("showChaseRabbit", this.showChaseRabbit);
            this.showSensorLines = this.getProperty("showSensorLines", this.showSensorLines);
            // ..
            this.minLookAhead = this.getProperty("minLookAhead", this.minLookAhead);
            this.maxLookAhead = this.getProperty("maxLookAhead", this.maxLookAhead);
            this.driverSkillLevel = this.getProperty("driverSkillLevel", this.driverSkillLevel);
            this.throttleSensitivity = this.getProperty("throttleSensitivity", this.throttleSensitivity);
            this.steeringSensitivity = this.getProperty("steeringSensitivity", this.steeringSensitivity);
            this.brakingSensitivity = this.getProperty("brakingSensitivity", this.brakingSensitivity);
            this.brakingTurnAngle = this.getProperty("brakingTurnAngle", this.brakingTurnAngle);
            this.brakingSpeedLimit = this.getProperty("brakingSpeedLimit", this.brakingSpeedLimit);
            this.skiddingSpeedLimit = this.getProperty("skiddingSpeedLimit", this.skiddingSpeedLimit);
            this.linearDampenForce = this.getProperty("linearDampenForce", this.linearDampenForce);
            this.resetMovingTimeout = this.getProperty("resetMovingTimeout", this.resetMovingTimeout);
            this.reverseThrottleTime = this.getProperty("reverseThrottleTime", this.reverseThrottleTime);
            this.driveSpeedMultiplier = this.getProperty("driveSpeedMultiplier", this.driveSpeedMultiplier);
            this.driveLineDistance = this.getProperty("driveLineDistance", this.driveLineDistance);
            this.maxRaceTrackSpeed = this.getProperty("maxRaceTrackSpeed", this.maxRaceTrackSpeed);
            this.trackManagerIdentity = this.getProperty("trackManagerIdentity", this.trackManagerIdentity);
            // ..
            this.vehicleTag = this.getProperty("vehicleTag", this.vehicleTag);
            this.obstacleTag = this.getProperty("obstacleTag", this.obstacleTag);
            this.sensorLength = this.getProperty("sensorLength", this.sensorLength);
            this.spacerWidths = this.getProperty("spacerWidths", this.spacerWidths);
            this.angleFactors = this.getProperty("angleFactors", this.angleFactors);
            this.initialOffsetX = this.getProperty("initialOffsetX", this.initialOffsetX);
            this.initialOffsetY = this.getProperty("initialOffsetY", this.initialOffsetY);
            this.initialOffsetZ = this.getProperty("initialOffsetZ", this.initialOffsetZ);
            this.sidewaysLength = this.getProperty("sidewaysLength", this.sidewaysLength);
            this.sidewaysOffset = this.getProperty("sidewaysOffset", this.sidewaysOffset);
            this.backBumperEdge = this.getProperty("backBumperEdge", this.backBumperEdge);
            this.powerBoosting = this.getProperty("powerBoosting", this.powerBoosting);
            this.wonderDistance = this.getProperty("wonderDistance", this.wonderDistance);
            this.avoidanceFactor = this.getProperty("avoidanceFactor", this.avoidanceFactor);
            this.avoidanceSpeed = this.getProperty("avoidanceSpeed", this.avoidanceSpeed);
            this.avoidanceTimeout = this.getProperty("avoidanceTimeout", this.avoidanceTimeout);
            this.avoidanceDistance = this.getProperty("avoidanceDistance", this.avoidanceDistance);
            // ..
            if (this.ackermanRadius <= 0)
                this.ackermanRadius = 1;
            if (this.recoveryRadius <= 0)
                this.recoveryRadius = 1;
            if (this.resetMovingTimeout <= 0)
                this.resetMovingTimeout = 3;
            if (this.reverseThrottleTime <= 0)
                this.reverseThrottleTime = 3;
            if (this.throttleSensitivity <= 0)
                this.throttleSensitivity = 1;
            if (this.steeringSensitivity <= 0)
                this.steeringSensitivity = 1;
            if (this.brakingSensitivity <= 0)
                this.brakingSensitivity = 1;
            if (this.linearDampenForce <= 0)
                this.linearDampenForce = 0.1;
            if (this.angleFactors <= 0)
                this.angleFactors = 1.5;
            if (this.sensorLength <= 0)
                this.sensorLength = 8;
            if (this.sidewaysLength <= 0)
                this.sidewaysLength = 1;
            // ..
            if (this.brakingSpeedLimit <= 0)
                this.brakingSpeedLimit = 40;
            if (this.skiddingSpeedLimit <= 0)
                this.skiddingSpeedLimit = 80;
            if (this.driveSpeedMultiplier <= 1)
                this.driveSpeedMultiplier = 5;
            if (this.trackManagerIdentity == null || this.trackManagerIdentity === "")
                this.trackManagerIdentity = "TrackManager";
            // ..
            const initialRaceLineNode = this.getProperty("initialRaceLineNode", 1);
            this.raceLineNode = (initialRaceLineNode - 1);
            // ..
            const randomizer = this.getRandomNumber(10, 15) * 1000;
            UNITY.SceneManager.SetInterval(randomizer, () => { this.randomSkillFactor = this.getRandomNumber(1, 20); });
        }
        initVehicleController() {
            this.m_rigidbodyPhysics = this.getComponent("UNITY.RigidbodyPhysics");
            this.m_checkpointManager = this.getComponent("PROJECT.CheckpointManager");
            if (this.m_rigidbodyPhysics != null) {
                this.m_rigidbodyPhysics.onCollisionEnterObservable.add((mesh) => {
                    const tag = UNITY.SceneManager.GetTransformTag(mesh);
                    if (tag === this.vehicleTag) {
                        // UNITY.SceneManager.ConsoleWarn(this.transform.name.toLocaleUpperCase() + " CAR COLLISION ENTER: " + mesh.name + " ---> TAG: " + tag);
                    }
                });
                this.m_rigidbodyPhysics.onCollisionStayObservable.add((mesh) => {
                    if (mesh != null) {
                        const tag = UNITY.SceneManager.GetTransformTag(mesh);
                        if (tag === this.vehicleTag) {
                            // UNITY.SceneManager.ConsoleLog(this.transform.name.toLocaleUpperCase() + " CAR COLLISION STAY: " + mesh.name + " ---> TAG: " + tag);
                        }
                    }
                });
                this.m_rigidbodyPhysics.onCollisionExitObservable.add((mesh) => {
                    if (mesh != null) {
                        const tag = UNITY.SceneManager.GetTransformTag(mesh);
                        if (tag === this.vehicleTag) {
                            // UNITY.SceneManager.ConsoleWarn(this.transform.name.toLocaleUpperCase() + " CAR COLLISION EXIT: " + mesh.name + " ---> TAG: " + tag);
                        }
                    }
                });
            }
            else {
                UNITY.SceneManager.LogWarning("Null rigidbody physics for: " + this.transform.name);
            }
            // Get Standard Car Controller
            this.m_standardCarController = this.getComponent("PROJECT.StandardCarController");
            //if (this.m_standardCarController != null) {
            //    this.m_standardCarController.playVehicleSounds = true;
            //} else {
            //    UNITY.SceneManager.LogWarning("Null standard car controller for: " + this.transform.name);
            //}
            // Get Race Track Manager Waypoints
            const waypointsTransform = UNITY.SceneManager.GetTransformNode(this.scene, this.trackManagerIdentity);
            if (waypointsTransform != null) {
                const raceTrackManager = UNITY.SceneManager.FindScriptComponent(waypointsTransform, "PROJECT.RaceTrackManager");
                if (raceTrackManager != null) {
                    this.waypointCount = 0;
                    this.waypointIndex = 0;
                    this.m_circuitInterfaces = raceTrackManager.getTrackNodes();
                    this.m_circuitRaceLine_1 = raceTrackManager.getControlPoints(0);
                    this.m_circuitRaceLine_2 = raceTrackManager.getControlPoints(1);
                    this.m_circuitRaceLine_3 = raceTrackManager.getControlPoints(2);
                    this.m_circuitRaceLine_4 = raceTrackManager.getControlPoints(3);
                    this.m_circuitRaceLine_5 = raceTrackManager.getControlPoints(4);
                    if (this.m_circuitInterfaces != null && this.m_circuitInterfaces.length > 0) {
                        this.waypointCount = this.m_circuitInterfaces.length;
                    }
                }
                else {
                    UNITY.SceneManager.LogWarning("Fail to locate race track manager for: " + this.transform.name);
                }
            }
            else {
                UNITY.SceneManager.LogWarning("Fail to locate race track manager '" + this.trackManagerIdentity + "' for: " + this.transform.name);
            }
        }
        updateVehicleController() {
            if (this.enableInput === true) {
                if (this.playerNumber === 0) {
                    this.updateAutoPilotDrive();
                }
                else {
                    this.updateManualInputDrive();
                }
            }
            //////////////////////////////////////////////////////////////////////////////////
            // Validate Vehicle Flipped Upright
            //////////////////////////////////////////////////////////////////////////////////
            if (this.resetTiming > 0 && this.m_standardCarController != null) {
                const gameTime = UNITY.SceneManager.GetGameTime();
                if (this.transform.up.y > 0.5 || this.m_standardCarController.getAbsoluteSpeed() > 1) {
                    this.vehicleResetCheck = gameTime;
                }
                if (gameTime > (this.vehicleResetCheck + this.resetTiming)) {
                    // FIXME: Reset To Last Check Point
                    this.transform.position.addInPlace(BABYLON.Vector3.Up().scale(0.5));
                    UNITY.Utilities.LookRotationToRef(this.transform.forward, this.transform.rotationQuaternion);
                }
            }
        }
        updateManualInputDrive() {
            if (this.m_standardCarController != null) {
                this.playerDeltaX = UNITY.InputController.GetUserInput(UNITY.UserInputAxis.Horizontal, this.playerNumber);
                this.playerDeltaY = UNITY.InputController.GetUserInput(UNITY.UserInputAxis.Vertical, this.playerNumber);
                this.playerMouseX = UNITY.InputController.GetUserInput(UNITY.UserInputAxis.MouseX, this.playerNumber);
                this.playerMouseY = UNITY.InputController.GetUserInput(UNITY.UserInputAxis.MouseY, this.playerNumber);
                // Get Button Triggers
                const auxForwardKeyboard = UNITY.InputController.GetKeyboardInput(this.auxKeyboardForawrd); // Player One Only
                const forwardKeyboard = UNITY.InputController.GetKeyboardInput(this.keyboardForawrd); // Player One Only
                const forwardTrigger = UNITY.InputController.GetGamepadTriggerInput(this.triggerForward, this.playerNumber);
                const forwardPedal = UNITY.InputController.GetGamepadButtonInput(this.pedelForward, this.playerNumber);
                const auxBackwardKeyboard = UNITY.InputController.GetKeyboardInput(this.auxKeyboardBackwards); // Player One Only
                const backwardKeyboard = UNITY.InputController.GetKeyboardInput(this.keyboardBackwards); // Player One Only
                const backwardTrigger = UNITY.InputController.GetGamepadTriggerInput(this.triggerBackwards, this.playerNumber);
                const backwardPedal = UNITY.InputController.GetGamepadButtonInput(this.pedalBackward, this.playerNumber);
                const handbrakeKeyboard = UNITY.InputController.GetKeyboardInput(this.keyboardHandbrake); // Player One Only
                const handbrakeButton = UNITY.InputController.GetGamepadButtonInput(this.buttonHandbrake, this.playerNumber);
                const handbrakeWheel_L = UNITY.InputController.GetGamepadButtonInput(this.leftWheelHandbrake, this.playerNumber);
                const handbrakeWheel_R = UNITY.InputController.GetGamepadButtonInput(this.rightWheelHandbrake, this.playerNumber);
                const donutKeyboard = UNITY.InputController.GetKeyboardInput(this.keyboardDonut); // Player One Only
                const donutButton = UNITY.InputController.GetGamepadButtonInput(this.buttonDonut, this.playerNumber);
                const donutWheel_L = UNITY.InputController.GetGamepadButtonInput(this.leftWheelDonut, this.playerNumber);
                const donutWheel_R = UNITY.InputController.GetGamepadButtonInput(this.rightWheelDonut, this.playerNumber);
                // Reset Player Movement
                let playerMovement = 0;
                let playerSteering = 0;
                let playerHandbrake = false;
                let playerDonuts = false;
                let wheelInput = false;
                // Primary Accelerattion
                if (forwardTrigger > 0.2)
                    playerMovement = forwardTrigger;
                else if (forwardPedal === true) {
                    playerMovement = 1;
                    wheelInput = true;
                }
                else if (this.playerNumber === UNITY.PlayerNumber.One && (forwardKeyboard === true || auxForwardKeyboard === true))
                    playerMovement = 1;
                // Braking Takes Precedence
                if (backwardTrigger > 0.2)
                    playerMovement = -backwardTrigger;
                else if (backwardPedal === true) {
                    playerMovement = -1;
                    wheelInput = true;
                }
                else if (this.playerNumber === UNITY.PlayerNumber.One && (backwardKeyboard === true || auxBackwardKeyboard === true))
                    playerMovement = -1;
                // Includes AD And Arrow Keys
                playerSteering = this.playerDeltaX;
                // Pull Hard Hand Brake Lever
                playerHandbrake = (handbrakeKeyboard === true || handbrakeButton === true || handbrakeWheel_L === true || handbrakeWheel_R === true);
                // Press Burnout Donut Button
                playerDonuts = (donutKeyboard === true || donutButton === true || donutWheel_L === true || donutWheel_R === true);
                // Validate Steering Wheel Mode
                if (this.steeringWheelMode === -1 && UNITY.UserInputOptions.SupportedInputDevices != null && UNITY.UserInputOptions.SupportedInputDevices.length > 0) {
                    const gamepad = UNITY.InputController.GetGamepad(this.playerNumber);
                    if (gamepad != null && gamepad.id != null) {
                        let foundSupportedDevice = false;
                        for (let index = 0; index < UNITY.UserInputOptions.SupportedInputDevices.length; index++) {
                            const wheel = UNITY.UserInputOptions.SupportedInputDevices[index];
                            if (gamepad.id.toLowerCase().indexOf(wheel.deviceName.toLowerCase()) >= 0) {
                                if (wheel.forwardButton > -1)
                                    this.pedelForward = wheel.forwardButton;
                                if (wheel.backwardButton > -1)
                                    this.pedalBackward = wheel.backwardButton;
                                if (wheel.leftHandBrake > -1)
                                    this.leftWheelHandbrake = wheel.leftHandBrake;
                                if (wheel.rightHandBrake > -1)
                                    this.rightWheelHandbrake = wheel.rightHandBrake;
                                if (wheel.leftDonutBoost > -1)
                                    this.leftWheelDonut = wheel.leftDonutBoost;
                                if (wheel.rightDonutBoost > -1)
                                    this.rightWheelDonut = wheel.rightDonutBoost;
                                foundSupportedDevice = true;
                                console.warn(gamepad.id + " steering wheel controls attached to: " + this.transform.name);
                                break;
                            }
                        }
                        this.steeringWheelMode = (foundSupportedDevice === true) ? 1 : 0;
                    }
                }
                // Drive Standard Car Controller
                this.m_standardCarController.ackermanTurnFactor = (wheelInput === true) ? this.ackermanRadius : 1.0;
                this.m_standardCarController.throttleEngineSpeed = 0;
                this.m_standardCarController.throttleBrakingForce = 0;
                this.m_standardCarController.drive(playerMovement, playerSteering, playerHandbrake, playerDonuts, 0, false);
            }
        }
        updateAutoPilotDrive() {
            if (this.m_standardCarController != null) {
                const gameTime = this.getGameTime();
                const deltaTime = this.getDeltaSeconds();
                const transformPosition = this.transform.getAbsolutePosition();
                this.raceLineNode = BABYLON.Scalar.Clamp(this.raceLineNode, 0, 4);
                if (this.m_chaseRabbitMesh == null) {
                    this.m_chaseRabbitMesh = BABYLON.MeshBuilder.CreateSphere(this.transform.name + ".Rabbit", { segments: 24, diameter: 1 }, this.scene);
                    this.m_chaseRabbitMesh.checkCollisions = false;
                    this.m_chaseRabbitMesh.receiveShadows = false;
                    this.m_chaseRabbitMesh.visibility = 1.0;
                    this.m_chaseRabbitMesh.isVisible = false;
                    this.resetChaseRabbitMesh();
                }
                if (this.m_chaseRabbitMesh != null) {
                    if (this.m_chaseRabbitMesh.isVisible === true && this.showChaseRabbit === false) {
                        this.m_chaseRabbitMesh.isVisible = false;
                    }
                    if (this.m_chaseRabbitMesh.isVisible === false && this.showChaseRabbit === true) {
                        this.m_chaseRabbitMesh.isVisible = true;
                    }
                }
                if (this.m_chasePointMesh == null) {
                    this.m_chasePointMesh = BABYLON.MeshBuilder.CreateBox(this.transform.name + ".Point", { size: 0.9 }, this.scene);
                    this.m_chasePointMesh.checkCollisions = false;
                    this.m_chasePointMesh.receiveShadows = false;
                    this.m_chasePointMesh.visibility = 1.0;
                    this.m_chasePointMesh.isVisible = false;
                    this.resetChasePointMesh();
                }
                if (this.m_chasePointMesh != null) {
                    if (this.m_chasePointMesh.isVisible === true && this.showChaseRabbit === false) {
                        this.m_chasePointMesh.isVisible = false;
                    }
                    if (this.m_chasePointMesh.isVisible === false && this.showChaseRabbit === true) {
                        this.m_chasePointMesh.isVisible = true;
                    }
                }
                ////////////////////////////////////////////////////////////////////////////////////////////
                // Update Avoidance Timer
                ////////////////////////////////////////////////////////////////////////////////////////////
                if (this.avoidanceTimer > 0) {
                    this.avoidanceTimer -= deltaTime;
                    if (this.avoidanceTimer <= 0) {
                        this.avoidanceTimer = 0;
                        this.avoidanceValue = 0;
                    }
                }
                ////////////////////////////////////////////////////////////////////////////////////////////
                // Sensor Update System
                ////////////////////////////////////////////////////////////////////////////////////////////
                let tagname = "";
                let contact = false;
                let raycast = null;
                let avoidance = 0;
                this.sidewaysOffsetVector.set(0, 0, -this.sidewaysOffset);
                this.backBumperEdgeVector.set(0, 0, -this.backBumperEdge);
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Setup Main Sensor Start
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                this.sensorStartPos.copyFrom(transformPosition);
                this.transform.up.scaleAndAddToRef(this.initialOffsetY, this.sensorStartPos);
                this.transform.forward.scaleAndAddToRef(this.initialOffsetZ, this.sensorStartPos);
                // Setup Main Sensor Point
                this.sensorPointPos.copyFrom(this.sensorStartPos);
                this.transform.forward.scaleAndAddToRef(this.sensorLength, this.sensorPointPos);
                this.sensorAnglePos.copyFrom(this.sensorPointPos);
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Setup Right Side Sensor Start
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.rsideStartPos, this.sidewaysOffsetVector);
                this.transform.up.scaleAndAddToRef(this.initialOffsetY, this.rsideStartPos);
                this.transform.right.scaleAndAddToRef(this.initialOffsetX, this.rsideStartPos);
                // Setup Right Side Sensor Point
                this.rsidePointPos.copyFrom(this.rsideStartPos);
                this.transform.right.scaleAndAddToRef(this.sidewaysLength, this.rsidePointPos);
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Setup Right Back Sensor Start
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.rbackStartPos, this.backBumperEdgeVector);
                this.transform.up.scaleAndAddToRef(this.initialOffsetY, this.rbackStartPos);
                this.transform.right.scaleAndAddToRef(this.initialOffsetX, this.rbackStartPos);
                // Setup Right Back Sensor Point
                this.rbackPointPos.copyFrom(this.rbackStartPos);
                this.transform.right.scaleAndAddToRef(this.sidewaysLength, this.rbackPointPos);
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Setup Left Side Sensor Start
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.lsideStartPos, this.sidewaysOffsetVector);
                this.transform.up.scaleAndAddToRef(this.initialOffsetY, this.lsideStartPos);
                this.transform.right.scaleAndAddToRef(-this.initialOffsetX, this.lsideStartPos);
                // Setup Left Side Sensor Point
                this.lsidePointPos.copyFrom(this.lsideStartPos);
                this.transform.right.scaleAndAddToRef(-this.sidewaysLength, this.lsidePointPos);
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Setup Left Back Sensor Start
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.lbackStartPos, this.backBumperEdgeVector);
                this.transform.up.scaleAndAddToRef(this.initialOffsetY, this.lbackStartPos);
                this.transform.right.scaleAndAddToRef(-this.initialOffsetX, this.lbackStartPos);
                // Setup Left Back Sensor Point
                this.lbackPointPos.copyFrom(this.lbackStartPos);
                this.transform.right.scaleAndAddToRef(-this.sidewaysLength, this.lbackPointPos);
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Save Initial Start Point
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                const firstSensorStartPos = this.sensorStartPos.clone();
                const firstSensorPointPos = this.sensorPointPos.clone();
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Main Right Line Raycast
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                let mainRightSensorContact = false;
                this.transform.right.scaleToRef(this.spacerWidths, this.tempScaleVector);
                this.sensorStartPos.addInPlace(this.tempScaleVector);
                this.sensorPointPos.addInPlace(this.tempScaleVector);
                tagname = "";
                contact = false;
                // FIXME: raycast = UNITY.RigidbodyPhysics.PhysicsRaycastToPoint(this.scene, this.sensorStartPos, this.sensorPointPos);
                if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                    tagname = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                    contact = (tagname == this.vehicleTag || tagname === this.obstacleTag);
                    if (contact === true) {
                        mainRightSensorContact = true;
                        avoidance -= 1.0;
                    }
                }
                if (this.showSensorLines === true) {
                    if (this.mainRightSensorLine == null)
                        this.mainRightSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".MainRightSensorLine", this.scene);
                    if (contact === true) {
                        this.mainRightSensorLine.drawLine([this.sensorStartPos, raycast.hitPoint], BABYLON.Color3.Yellow());
                    }
                    else {
                        this.mainRightSensorLine.drawLine([this.sensorStartPos, this.sensorPointPos], BABYLON.Color3.Blue());
                    }
                }
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Angle Right Line Raycast
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                let angleRightSensorContact = false;
                this.transform.right.scaleToRef((this.spacerWidths * 2) * this.angleFactors, this.tempScaleVector);
                this.sensorAnglePos.addInPlace(this.tempScaleVector);
                tagname = "";
                contact = false;
                // FIXME: raycast = UNITY.RigidbodyPhysics.PhysicsRaycastToPoint(this.scene, this.sensorStartPos, this.sensorAnglePos);
                if (mainRightSensorContact === false) {
                    if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                        tagname = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                        contact = (tagname == this.vehicleTag || tagname === this.obstacleTag);
                        if (contact === true) {
                            angleRightSensorContact = true;
                            avoidance -= 0.5;
                        }
                    }
                }
                if (this.showSensorLines === true) {
                    if (this.angleRightSensorLine == null)
                        this.angleRightSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".AngleRightSensorLine", this.scene);
                    if (contact === true) {
                        this.angleRightSensorLine.drawLine([this.sensorStartPos, raycast.hitPoint], BABYLON.Color3.Yellow());
                    }
                    else {
                        this.angleRightSensorLine.drawLine([this.sensorStartPos, this.sensorAnglePos], BABYLON.Color3.Blue());
                    }
                }
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Side Right Line Raycast
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                let sideRightSensorContact = false;
                tagname = "";
                contact = false;
                // FIXME: raycast = UNITY.RigidbodyPhysics.PhysicsRaycastToPoint(this.scene, this.rsideStartPos, this.rsidePointPos);
                if (mainRightSensorContact === false && angleRightSensorContact === false) {
                    if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                        tagname = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                        contact = (tagname == this.vehicleTag || tagname === this.obstacleTag);
                        if (contact === true) {
                            sideRightSensorContact = true;
                            avoidance -= 0.5;
                        }
                    }
                }
                if (this.showSensorLines === true) {
                    if (this.sideRightSensorLine == null)
                        this.sideRightSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".SideRightSensorLine", this.scene);
                    if (contact === true) {
                        this.sideRightSensorLine.drawLine([this.rsideStartPos, raycast.hitPoint], BABYLON.Color3.Yellow());
                    }
                    else {
                        this.sideRightSensorLine.drawLine([this.rsideStartPos, this.rsidePointPos], BABYLON.Color3.Blue());
                    }
                }
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Back Right Line Raycast
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                tagname = "";
                contact = false;
                // FIXME: raycast = UNITY.RigidbodyPhysics.PhysicsRaycastToPoint(this.scene, this.rbackStartPos, this.rbackPointPos);
                if (mainRightSensorContact === false && angleRightSensorContact === false && sideRightSensorContact === false) {
                    if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                        tagname = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                        contact = (tagname == this.vehicleTag || tagname === this.obstacleTag);
                        if (contact === true) {
                            avoidance -= 0.5;
                        }
                    }
                }
                if (this.showSensorLines === true) {
                    if (this.backRightSensorLine == null)
                        this.backRightSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".BackRightSensorLine", this.scene);
                    if (contact === true) {
                        this.backRightSensorLine.drawLine([this.rbackStartPos, raycast.hitPoint], BABYLON.Color3.Yellow());
                    }
                    else {
                        this.backRightSensorLine.drawLine([this.rbackStartPos, this.rbackPointPos], BABYLON.Color3.Blue());
                    }
                }
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Main Left Line Raycast
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                let mainLeftSensorContact = false;
                this.transform.right.scaleToRef(-(this.spacerWidths * 2), this.tempScaleVector);
                this.sensorStartPos.addInPlace(this.tempScaleVector);
                this.sensorPointPos.addInPlace(this.tempScaleVector);
                tagname = "";
                contact = false;
                // FIXME: raycast = UNITY.RigidbodyPhysics.PhysicsRaycastToPoint(this.scene, this.sensorStartPos, this.sensorPointPos);
                if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                    tagname = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                    contact = (tagname == this.vehicleTag || tagname === this.obstacleTag);
                    if (contact === true) {
                        mainLeftSensorContact = true;
                        avoidance += 1.0;
                    }
                }
                if (this.showSensorLines === true) {
                    if (this.mainLeftSensorLine == null)
                        this.mainLeftSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".MainLeftSensorLine", this.scene);
                    if (contact === true) {
                        this.mainLeftSensorLine.drawLine([this.sensorStartPos, raycast.hitPoint], BABYLON.Color3.Yellow());
                    }
                    else {
                        this.mainLeftSensorLine.drawLine([this.sensorStartPos, this.sensorPointPos], BABYLON.Color3.Blue());
                    }
                }
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Angle Left Line Raycast
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                let angleLeftSensorContact = false;
                this.transform.right.scaleToRef(-(this.spacerWidths * 4) * this.angleFactors, this.tempScaleVector);
                this.sensorAnglePos.addInPlace(this.tempScaleVector);
                tagname = "";
                contact = false;
                // FIXME: raycast = UNITY.RigidbodyPhysics.PhysicsRaycastToPoint(this.scene, this.sensorStartPos, this.sensorAnglePos);
                if (mainLeftSensorContact === false) {
                    if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                        tagname = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                        contact = (tagname == this.vehicleTag || tagname === this.obstacleTag);
                        if (contact === true) {
                            angleLeftSensorContact = true;
                            avoidance += 0.5;
                        }
                    }
                }
                if (this.showSensorLines === true) {
                    if (this.angleLeftSensorLine == null)
                        this.angleLeftSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".AngleLeftSensorLine", this.scene);
                    if (contact === true) {
                        this.angleLeftSensorLine.drawLine([this.sensorStartPos, raycast.hitPoint], BABYLON.Color3.Yellow());
                    }
                    else {
                        this.angleLeftSensorLine.drawLine([this.sensorStartPos, this.sensorAnglePos], BABYLON.Color3.Blue());
                    }
                }
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Side Left Line Raycast
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                let sideLeftSensorContact = false;
                tagname = "";
                contact = false;
                // FIXME: raycast = UNITY.RigidbodyPhysics.PhysicsRaycastToPoint(this.scene, this.lsideStartPos, this.lsidePointPos);
                if (mainLeftSensorContact === false && angleLeftSensorContact === false) {
                    if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                        tagname = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                        contact = (tagname == this.vehicleTag || tagname === this.obstacleTag);
                        if (contact === true) {
                            sideLeftSensorContact = true;
                            avoidance += 0.5;
                        }
                    }
                }
                if (this.showSensorLines === true) {
                    if (this.sideLeftSensorLine == null)
                        this.sideLeftSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".SideLeftSensorLine", this.scene);
                    if (contact === true) {
                        this.sideLeftSensorLine.drawLine([this.lsideStartPos, raycast.hitPoint], BABYLON.Color3.Yellow());
                    }
                    else {
                        this.sideLeftSensorLine.drawLine([this.lsideStartPos, this.lsidePointPos], BABYLON.Color3.Blue());
                    }
                }
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Back Left Line Raycast
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                tagname = "";
                contact = false;
                // FIXME: raycast = UNITY.RigidbodyPhysics.PhysicsRaycastToPoint(this.scene, this.lbackStartPos, this.lbackPointPos);
                if (mainLeftSensorContact === false && angleLeftSensorContact === false && sideLeftSensorContact === false) {
                    if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                        tagname = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                        contact = (tagname == this.vehicleTag || tagname === this.obstacleTag);
                        if (contact === true) {
                            avoidance += 0.5;
                        }
                    }
                }
                if (this.showSensorLines === true) {
                    if (this.backLeftSensorLine == null)
                        this.backLeftSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".BackLeftSensorLine", this.scene);
                    if (contact === true) {
                        this.backLeftSensorLine.drawLine([this.lbackStartPos, raycast.hitPoint], BABYLON.Color3.Yellow());
                    }
                    else {
                        this.backLeftSensorLine.drawLine([this.lbackStartPos, this.lbackPointPos], BABYLON.Color3.Blue());
                    }
                }
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Main Center Line Raycast
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                tagname = "";
                contact = false;
                // FIXME: raycast = UNITY.RigidbodyPhysics.PhysicsRaycastToPoint(this.scene, firstSensorStartPos, firstSensorPointPos);
                if (avoidance === 0) {
                    if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                        tagname = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                        contact = (tagname == this.vehicleTag || tagname === this.obstacleTag);
                        if (contact === true) {
                            if (raycast.hitNormal.x < 0) {
                                avoidance = -1;
                            }
                            else {
                                avoidance = 1;
                            }
                        }
                    }
                }
                if (this.showSensorLines === true) {
                    if (this.mainCenterSensorLine == null)
                        this.mainCenterSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".MainCenterSensorLine", this.scene);
                    if (contact === true) {
                        this.mainCenterSensorLine.drawLine([firstSensorStartPos, raycast.hitPoint], BABYLON.Color3.Yellow());
                    }
                    else {
                        this.mainCenterSensorLine.drawLine([firstSensorStartPos, firstSensorPointPos], BABYLON.Color3.Blue());
                    }
                }
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // TODO - Long Range Brake Threat Raycast
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                /*
                tagname = "";
                contact = false;
                raycast = UNITY.SceneManager.PhysicsRaycastToPoint(this.scene, firstSensorStartPos, firstSensorPointPos);
                if (avoidance === 0) {
                    if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                        tagname = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                        contact = (tagname == this.vehicleTag || tagname === this.obstacleTag);
                        if (contact === true) {
                        }
                    }
                }
                if (this.showSensorLines === true) {
                    if (this.mainCenterSensorLine == null) this.mainCenterSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".MainCenterSensorLine", this.scene);
                    if (contact === true) {
                        this.mainCenterSensorLine.drawLine([firstSensorStartPos, raycast.hitPoint], BABYLON.Color3.Yellow());
                    } else {
                        this.mainCenterSensorLine.drawLine([firstSensorStartPos, firstSensorPointPos], BABYLON.Color3.Blue());
                    }
                }
                */
                ////////////////////////////////////////////////////////////////////////////////////////////
                const trackNode = this.getCurrentTrackNode(this.waypointIndex);
                const controlPoint = this.getCurrentControlPoint(this.raceLineNode, this.waypointIndex);
                if (this.m_chaseRabbitMesh != null && this.waypointCount > 0 && trackNode != null && controlPoint != null) {
                    this.waypointPosition.set(controlPoint.position.x, controlPoint.position.y, controlPoint.position.z);
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    const targetSpeed = (controlPoint.speed > 0 ? controlPoint.speed : 100) * this.getDriverSkillFactor();
                    const targetRadius = (trackNode.radius * 1);
                    const distToTarget = BABYLON.Vector3.Distance(this.waypointPosition, transformPosition);
                    if (distToTarget < targetRadius) {
                        if (this.prevTargetSpeed <= 0)
                            this.prevTargetSpeed = targetSpeed;
                        this.nextTargetSpeed = BABYLON.Scalar.Lerp(this.prevTargetSpeed, targetSpeed, (1.0 - (distToTarget / targetRadius)));
                        if (this.showChaseRabbit === true)
                            this.rabbitTrackerColor = this.redTrackingColor;
                    }
                    else {
                        this.nextTargetSpeed = targetSpeed;
                        if (this.showChaseRabbit === true)
                            this.rabbitTrackerColor = this.greenTrackingColor;
                    }
                    const gradientSpeed = this.m_standardCarController.getGradientSpeed();
                    const americanSpeed = this.m_standardCarController.getAmericanSpeed();
                    const isSkidding = this.m_standardCarController.getCurrentSkidding();
                    const lookAhead = BABYLON.Scalar.Lerp(this.minLookAhead, this.maxLookAhead, gradientSpeed);
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // TODO - UPDATE CHASE RABBIT - Walk Spline Waypoint Positions - (RaceTrackManager.GetRoadAheadDirection) - ???
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    /* GET ROUT POINT WITH DISTANCE
                    const pointToPointThreshold:number = 6;
                    const targetDelta = this.m_chaseRabbitMesh.position.subtract(transformPosition);
                    const deltaLength:number = targetDelta.length();
                    if (deltaLength < pointToPointThreshold) {
                        this.waypointIndex = (this.waypointIndex + 1) % this.m_circuitInterfaces.length;
                    }
                    // ..
                    this.m_chaseRabbitMesh.position = this.m_circuitInterfaces[this.waypointIndex].localPosition.clone();
                    this.m_chaseRabbitMesh.rotationQuaternion = this.m_circuitInterfaces[this.waypointIndex].localRotation.clone();
                    // ..
                    // get our current progress along the route
                    const progressPoint = this.raceTrackManager.getRoutePoint(this.progressDistance);
                    const aheadPoint = this.raceTrackManager.getRoutePoint(this.progressDistance + 40);
                    // ..
                    this.m_chasePointMesh.position.copyFrom(aheadPoint.position);
                    UNITY.Utilities.LookRotationToRef(aheadPoint.direction, this.m_chasePointMesh.rotationQuaternion);
                    // ..
                    const progressDelta = progressPoint.position.subtract(transformPosition);
                    if (BABYLON.Vector3.Dot(progressDelta, progressPoint.direction) < 0) {
                        this.progressDistance += progressDelta.length();
                    }
                    UTIL.PrintToScreen("Waypoint: " + this.waypointIndex + " --> Delta Length: " + deltaLength.toFixed(2) + " --> Progress Distance: " + this.progressDistance);
                    */
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // TODO - UPDATE CHASE RABBIT - Walk Spline Waypoint Positions - (RaceTrackManager.GetRoadAheadDirection) - ???
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    const rabbitPosition = this.m_chaseRabbitMesh.getAbsolutePosition();
                    const rabbitDistance = BABYLON.Vector3.Distance(transformPosition, rabbitPosition);
                    if (rabbitDistance <= lookAhead) {
                        this.chaseRabbitSpeed = BABYLON.Scalar.Lerp(1.0, this.driveSpeedMultiplier, gradientSpeed);
                        this.m_chaseRabbitMesh.lookAt(this.waypointPosition);
                        this.m_chaseRabbitMesh.translate(BABYLON.Axis.Z, this.chaseRabbitSpeed);
                    }
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // Avoidance Mode Tracking
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (avoidance !== 0) {
                        this.avoidanceValue = avoidance; // Last Avoidance Value
                        this.avoidanceTimer = this.avoidanceTimeout; // Reset Avoidance Timer
                    }
                    if (this.m_checkpointManager != null) {
                        const currentCheckpoint = this.m_checkpointManager.getCheckPoint();
                        if (currentCheckpoint != this.lastCheckpoint) {
                            this.randomTurning = this.generateRandonNumber(0, 3);
                            if (this.powerBoosting > 0) {
                                this.randomBoosting = this.generateRandonNumber(0, this.powerBoosting);
                            }
                            if (this.wonderDistance > 0) {
                                const minimumVal = this.driveLineDistance;
                                const randomSign = Math.sign(this.generateRandonNumber(-1, 1));
                                this.randomDistance = this.generateRandonNumber(minimumVal, (minimumVal + this.wonderDistance)) * randomSign;
                            }
                            this.lastCheckpoint = currentCheckpoint;
                        }
                    }
                    else {
                        this.randomTurning = 0;
                        this.randomBoosting = 0;
                        this.randomDistance = 0;
                    }
                    let wantedAvoidDistance = (this.avoidanceTimer > 0 && this.avoidanceValue !== 0) ? (this.avoidanceDistance * Math.sign(this.avoidanceValue)) : 0;
                    wantedAvoidDistance += this.randomDistance;
                    this.avoidanceLerp = BABYLON.Scalar.Lerp(this.avoidanceLerp, wantedAvoidDistance, (this.avoidanceSpeed * deltaTime));
                    this.avoidPositionOffset.set(this.avoidanceLerp, 0, 0);
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    UNITY.Utilities.GetAbsolutePositionToRef(this.m_chaseRabbitMesh, this.m_chasePointMesh.position, this.avoidPositionOffset);
                    if (this.showChaseRabbit === true) {
                        this.trackVehiclePosition.set(transformPosition.x, (transformPosition.y + 0.5), transformPosition.z);
                        // DEPRECIATED: this.trackRabbitPosition.set(rabbitPosition.x, (rabbitPosition.y + 0.25), rabbitPosition.z);
                        this.trackRabbitPosition.set(this.m_chasePointMesh.position.x, (this.m_chasePointMesh.position.y + 0.25), this.m_chasePointMesh.position.z);
                        if (this.rabbitTrackerLine == null)
                            this.rabbitTrackerLine = new UNITY.LinesMeshRenderer((this.transform.name + ".TrackingLine"), this.scene);
                        if (this.rabbitTrackerLine != null)
                            this.rabbitTrackerLine.drawLine([this.trackVehiclePosition, this.trackRabbitPosition], this.rabbitTrackerColor);
                    }
                    // ..
                    // Validate Waypoint Distance
                    // ..
                    const waypointDistance = BABYLON.Vector3.Distance(rabbitPosition, this.waypointPosition);
                    if (waypointDistance <= 5.0) {
                        this.prevTargetSpeed = this.nextTargetSpeed;
                        this.waypointIndex++;
                        if (this.waypointIndex >= this.waypointCount) {
                            this.waypointIndex = 0;
                        }
                    }
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // DEPRECIATED: UNITY.Utilities.InverseTransformPointToRef(this.transform, rabbitPosition, this.localTargetPosition);
                    UNITY.Utilities.InverseTransformPointToRef(this.transform, this.m_chasePointMesh.position, this.localTargetPosition);
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    const localTargetAngle = BABYLON.Tools.ToDegrees(Math.atan2(this.localTargetPosition.x, this.localTargetPosition.z));
                    const cornerAngle = BABYLON.Scalar.Clamp(Math.abs(localTargetAngle), 0, 90);
                    const cornerFactor = (cornerAngle / 90);
                    // ..
                    // Update Vehicle Driving
                    // ..
                    let braking = 0;
                    let slowdown = 0;
                    let boosting = this.randomBoosting;
                    let topspeed = this.maxRaceTrackSpeed;
                    let throttle = (1.0 * this.throttleSensitivity);
                    let steering = BABYLON.Scalar.Clamp(((this.localTargetPosition.x / this.localTargetPosition.length()) * this.steeringSensitivity), -1, 1);
                    if (this.avoidanceFactor > 0 && avoidance !== 0) {
                        const lowSpeedAvoidance = ((avoidance * 0.112) * this.avoidanceFactor);
                        const highSpeedAvoidance = ((avoidance * 0.06) * this.avoidanceFactor);
                        steering += BABYLON.Scalar.Lerp(lowSpeedAvoidance, highSpeedAvoidance, gradientSpeed);
                    }
                    let handbraking = false;
                    if (this.nextTargetSpeed <= 0)
                        this.nextTargetSpeed = targetSpeed;
                    if (americanSpeed > this.nextTargetSpeed) { // Target Speed Throttling
                        slowdown = BABYLON.Scalar.Lerp(0.0, this.linearDampenForce, gradientSpeed);
                        throttle *= 0.2; // Note : 20 Percent Throttle Input
                    }
                    if (this.brakingTurnAngle > 0) { // Corner Angle Foot Braking
                        const checkCornerAngle = (this.brakingTurnAngle - this.randomTurning);
                        if (cornerAngle >= checkCornerAngle && americanSpeed >= this.brakingSpeedLimit) {
                            braking = BABYLON.Scalar.Lerp(0, (1 + gradientSpeed), cornerFactor);
                            slowdown = 0;
                            // ..
                            // Hard Hand Braking (Drifting)
                            // ..
                            const skiddingTriggerSpeed = (isSkidding === true) ? this.brakingSpeedLimit : this.skiddingSpeedLimit;
                            handbraking = (braking > 0 && americanSpeed >= skiddingTriggerSpeed);
                            if (handbraking === true)
                                braking = 1.0; // Note: Use Hand Braking Zone Strength
                        }
                    }
                    if (braking > 0)
                        braking = BABYLON.Scalar.Clamp((braking * this.brakingSensitivity), 0, 1);
                    if (braking > 0)
                        throttle = (-braking);
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // Reverse Movement Fix Mode
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (this.reverseFixMode === true) {
                        throttle = -1;
                        boosting = 0;
                        steering = 0;
                        slowdown = 0;
                        handbraking = false;
                    }
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // Validate No Forward Velocity
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (throttle >= 0.1 && americanSpeed < 2.0) {
                        this.noMovementTime += deltaTime;
                    }
                    else {
                        this.noMovementTime = 0;
                    }
                    if (this.noMovementTime >= this.resetMovingTimeout) {
                        this.noMovementTime = 0;
                        this.reverseFixMode = true;
                        this.recoveryFixMode = true;
                        const reverseTime = (this.reverseThrottleTime * 1000);
                        const recoveryTime = ((this.reverseThrottleTime * 1000) * 3.0);
                        UNITY.SceneManager.SetTimeout(reverseTime, () => { this.reverseFixMode = false; });
                        UNITY.SceneManager.SetTimeout(recoveryTime, () => { this.recoveryFixMode = false; });
                    }
                    this.m_standardCarController.ackermanTurnFactor = (this.recoveryFixMode === true) ? this.recoveryRadius : 1.0;
                    this.m_standardCarController.throttleEngineSpeed = topspeed;
                    this.m_standardCarController.throttleBrakingForce = slowdown;
                    this.m_standardCarController.drive(throttle, steering, handbraking, false, boosting, true);
                }
            }
        }
        getDriverSkillFactor() {
            let result = 0.60;
            let skill = this.driverSkillLevel;
            if (this.randomSkillFactor >= 18) {
                skill += 2;
            }
            else if (this.randomSkillFactor >= 12) {
                skill += 1;
            }
            skill = BABYLON.Scalar.Clamp(skill, 1, 10);
            // WM.PrintToScreen("Driver Skill Level: " + skill);
            switch (skill) {
                case 10:
                    result = 1.00;
                    break;
                case 9:
                    result = 0.98;
                    break;
                case 8:
                    result = 0.95;
                    break;
                case 7:
                    result = 0.90;
                    break;
                case 6:
                    result = 0.85;
                    break;
                case 5:
                    result = 0.80;
                    break;
                case 4:
                    result = 0.75;
                    break;
                case 3:
                    result = 0.70;
                    break;
                case 2:
                    result = 0.65;
                    break;
                case 1:
                    result = 0.60;
                    break;
            }
            return result;
        }
        getCurrentTrackNode(index) {
            let result = null;
            if (index >= 0 && index < this.waypointCount) {
                result = this.m_circuitInterfaces[index];
            }
            return result;
        }
        getCurrentControlPoint(lane, index) {
            let result = null;
            if (index >= 0 && index < this.waypointCount) {
                switch (lane) {
                    case 0:
                        result = this.m_circuitRaceLine_1[index];
                        break;
                    case 1:
                        result = this.m_circuitRaceLine_2[index];
                        break;
                    case 2:
                        result = this.m_circuitRaceLine_3[index];
                        break;
                    case 3:
                        result = this.m_circuitRaceLine_4[index];
                        break;
                    case 4:
                        result = this.m_circuitRaceLine_5[index];
                        break;
                }
            }
            return result;
        }
        getRandomNumber(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        generateRandonNumber(min, max, decimals = 2) {
            const rand = (Math.random() * (max - min) + min).toFixed(decimals);
            return parseFloat(rand);
        }
        destroyVehicleController() {
            this.m_circuitInterfaces = null;
            this.m_circuitRaceLine_1 = null;
            this.m_circuitRaceLine_2 = null;
            this.m_circuitRaceLine_3 = null;
            this.m_circuitRaceLine_4 = null;
            this.m_circuitRaceLine_5 = null;
            this.m_rigidbodyPhysics = null;
            this.m_standardCarController = null;
            if (this.m_chasePointMesh != null) {
                this.m_chasePointMesh.dispose();
                this.m_chasePointMesh = null;
            }
            if (this.m_chaseRabbitMesh != null) {
                this.m_chaseRabbitMesh.dispose();
                this.m_chaseRabbitMesh = null;
            }
        }
    }
    PROJECT.VehicleInputController = VehicleInputController;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class VehicleNetworkLabel
    */
    class VehicleNetworkLabel extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.label = null;
            this.autoCreate = true;
            this.offsetX = 0;
            this.offsetY = 0;
            this.labelColor = new BABYLON.Color3(1.0, 1.0, 1.0);
            this.borderColor = new BABYLON.Color3(0.0, 0.8431373, 0.827451);
            this.backgroundColor = new BABYLON.Color3(0.0, 0.4745098, 0.4666667);
            this.labelCreated = false;
        }
        update() {
            if (this.labelCreated === false && this.autoCreate === true && this.isReady()) {
                if (BABYLON.NetworkManager.HasJoinedRoom()) {
                    const ownerName = UNITY.EntityController.QueryNetworkAttribute(this.transform, "ownerName");
                    if (ownerName != null && ownerName !== "") {
                        this.autoCreate = false;
                        this.labelCreated = true;
                        this.createLabel(ownerName);
                    }
                }
            }
        }
        createLabel(name) {
            const advancedTexture = UNITY.SceneManager.GetFullscreenUI(this.scene);
            this.label = new BABYLON.GUI.TextBlock();
            this.label.text = name;
            this.label.color = this.labelColor.toHexString(); // "white";
            this.label.fontSize = 24;
            // ..
            this.rect = new BABYLON.GUI.Rectangle();
            this.rect.width = "200px";
            this.rect.height = "40px";
            this.rect.cornerRadius = 10;
            this.rect.color = this.borderColor.toHexString(); // "#00D7D3";
            this.rect.thickness = 4;
            this.rect.background = this.backgroundColor.toHexString(); // "#007977";
            this.rect.addControl(this.label);
            // ..
            advancedTexture.addControl(this.rect);
            this.rect.linkWithMesh(this.transform);
            this.rect.linkOffsetXInPixels = this.offsetX;
            this.rect.linkOffsetYInPixels = this.offsetY;
            // FIXME: One Of Them Does Not Get The Label Created
            // console.warn("WTF: Owner Name");
            // console.log(name);
        }
        destroy() {
            console.warn("*** GOT DESTROY MESSAGE ***");
            if (this.label != null) {
                this.label.dispose();
                this.label = null;
            }
            if (this.rect != null) {
                this.rect.dispose();
                this.rect = null;
            }
        }
    }
    PROJECT.VehicleNetworkLabel = VehicleNetworkLabel;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
     * Babylon toolkit default camera system class
     * @class DefaultCameraSystem - All rights reserved (c) 2020 Mackey Kinard
     * https://doc.babylonjs.com/divingDeeper/postProcesses/defaultRenderingPipeline
     */
    class DefaultCameraSystem extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.mainCamera = false;
            this.cameraType = 0;
            this.cameraInertia = 0.5;
            this.cameraController = null;
            this.immersiveOptions = null;
            this.arcRotateConfig = null;
            this.multiPlayerSetup = null;
            this.fullScreenToggle = 0;
            this.editorPostProcessing = null;
            this.m_cameraRig = null;
        }
        static GetRenderingPipeline() { return PROJECT.DefaultCameraSystem.renderingPipeline; }
        ;
        static GetScreenSpacePipeline() { return PROJECT.DefaultCameraSystem.screenSpacePipeline; }
        ;
        static IsCameraSystemReady() { return PROJECT.DefaultCameraSystem.cameraReady; }
        isMainCamera() { return this.mainCamera; }
        getCameraType() { return this.cameraType; }
        awake() { this.awakeCameraSystemState(); }
        start() { this.startCameraSystemState(); }
        update() { this.updateCameraSystemState(); }
        destroy() { this.destroyCameraSystemState(); }
        /////////////////////////////////////////////
        // Universal Camera System State Functions //
        /////////////////////////////////////////////
        awakeCameraSystemState() {
            this.mainCamera = (this.getTransformTag() === "MainCamera");
            this.cameraType = this.getProperty("mainCameraType", this.cameraType);
            this.cameraInertia = this.getProperty("setCameraInertia", this.cameraInertia);
            this.fullScreenToggle = this.getProperty("fullScreenToggle", this.fullScreenToggle);
            this.immersiveOptions = this.getProperty("immersiveOptions", this.immersiveOptions);
            this.arcRotateConfig = this.getProperty("arcRotateConfig", this.arcRotateConfig);
            this.multiPlayerSetup = this.getProperty("multiPlayerSetup", this.multiPlayerSetup);
            this.cameraController = this.getProperty("cameraController", this.cameraController);
            this.editorPostProcessing = this.getProperty("renderingPipeline", this.editorPostProcessing);
            this.cleanCameraSystemState();
            if (this.fullScreenToggle === 0) {
                UNITY.InputController.OnKeyboardPress(UNITY.UserInputKey.F, () => {
                    this.scene.getEngine().enterFullscreen(true);
                });
            }
        }
        startCameraSystemState() {
            return __awaiter(this, void 0, void 0, function* () {
                UNITY.Utilities.ValidateTransformQuaternion(this.transform);
                if (this.multiPlayerSetup != null) {
                    PROJECT.DefaultCameraSystem.startupMode = this.multiPlayerSetup.playerStartupMode;
                    PROJECT.DefaultCameraSystem.stereoCameras = this.multiPlayerSetup.stereoSideBySide;
                }
                // ..
                // Default Camera System Support
                // ..
                this.m_cameraRig = this.getCameraRig();
                if (this.m_cameraRig != null) {
                    this.m_cameraRig.inertia = this.cameraInertia;
                    if (this.cameraController != null) {
                        this.m_cameraRig.speed = this.cameraController.cameraSpeed;
                        this.m_cameraRig.inverseRotationSpeed = this.cameraController.invRotationSpeed;
                        if (this.m_cameraRig instanceof BABYLON.UniversalCamera) {
                            this.m_cameraRig.gamepadAngularSensibility = this.cameraController.gamepadRotation;
                            this.m_cameraRig.gamepadMoveSensibility = this.cameraController.gamepadMovement;
                            this.m_cameraRig.touchAngularSensibility = this.cameraController.touchRotation;
                            this.m_cameraRig.touchMoveSensibility = this.cameraController.touchMovement;
                        }
                        if (this.cameraController.keyboardWASD === true) {
                            if (this.m_cameraRig.inputs != null && this.m_cameraRig.inputs.attached != null && this.m_cameraRig.inputs.attached.keyboard != null) {
                                if (this.m_cameraRig.inputs.attached.keyboard instanceof BABYLON.FreeCameraKeyboardMoveInput) {
                                    const cinput = this.m_cameraRig.inputs.attached.keyboard;
                                    cinput.keysUp.push(UNITY.UserInputKey.W);
                                    cinput.keysLeft.push(UNITY.UserInputKey.A);
                                    cinput.keysDown.push(UNITY.UserInputKey.S);
                                    cinput.keysRight.push(UNITY.UserInputKey.D);
                                    cinput.rotationSpeed = this.cameraController.rotationSpeed;
                                    if (this.cameraController.arrowKeyRotation === true) {
                                        cinput.keysLeft = [UNITY.UserInputKey.A];
                                        cinput.keysRight = [UNITY.UserInputKey.D];
                                        cinput.keysRotateLeft = [UNITY.UserInputKey.LeftArrow];
                                        cinput.keysRotateRight = [UNITY.UserInputKey.RightArrow];
                                    }
                                }
                            }
                        }
                    }
                    if (this.m_cameraRig.inputs != null && this.m_cameraRig.inputs.attached != null && this.m_cameraRig.inputs.attached.mouse != null) {
                        const mouseInput = this.m_cameraRig.inputs.attached.mouse;
                        // ..
                        // NOTE: Touch Enabled Mouse Hack
                        // ..
                        if (UNITY.Utilities.HasOwnProperty(mouseInput, "touchEnabled")) {
                            mouseInput.touchEnabled = true;
                        }
                    }
                    if (this.cameraType === 0 || this.cameraType === 4) { // Universal And Free Target Camera
                        //if (PROJECT.DefaultCameraSystem.PlayerOneCamera == null) {
                        PROJECT.DefaultCameraSystem.PlayerOneCamera = this.m_cameraRig;
                        PROJECT.DefaultCameraSystem.PlayerOneCamera.inertia = this.cameraInertia;
                        PROJECT.DefaultCameraSystem.PlayerOneCamera.transform = this.transform;
                        //}             
                    }
                    else if (this.cameraType === 1 || this.cameraType === 2) { // WebXR Camera Types
                        //if (PROJECT.DefaultCameraSystem.PlayerOneCamera == null) {
                        PROJECT.DefaultCameraSystem.PlayerOneCamera = this.m_cameraRig;
                        PROJECT.DefaultCameraSystem.PlayerOneCamera.inertia = this.cameraInertia;
                        PROJECT.DefaultCameraSystem.PlayerOneCamera.transform = this.transform;
                        //}             
                        if (this.immersiveOptions != null) {
                            const localStorageRequired = (this.immersiveOptions.localStorageOption === true);
                            if (localStorageRequired === false || (localStorageRequired === true && UNITY.WindowManager.GetVirtualRealityEnabled())) {
                                let webvrFloorMeshes = null;
                                let webvrHelperOptions = null;
                                let webvrImmersiveMode = (this.cameraType === 1) ? "immersive-ar" : "immersive-vr";
                                let webvrReferenceType = "local-floor";
                                switch (this.immersiveOptions.referenceSpaceType) {
                                    case 0:
                                        webvrReferenceType = "viewer";
                                        break;
                                    case 1:
                                        webvrReferenceType = "local";
                                        break;
                                    case 2:
                                        webvrReferenceType = "local-floor";
                                        break;
                                    case 4:
                                        webvrReferenceType = "unbounded";
                                        break;
                                    default:
                                        webvrReferenceType = "local-floor";
                                        break;
                                }
                                if (this.immersiveOptions.setFloorMeshesTags == null || this.immersiveOptions.setFloorMeshesTags === "")
                                    this.immersiveOptions.setFloorMeshesTags = "Navigation";
                                if (this.immersiveOptions.defaultTeleportationSetup.useTeleportation === true)
                                    webvrFloorMeshes = this.scene.getMeshesByTags(this.immersiveOptions.setFloorMeshesTags);
                                if (this.immersiveOptions.defaultTeleportationSetup.useTeleportation === true && webvrFloorMeshes != null && webvrFloorMeshes.length > 0) {
                                    webvrHelperOptions = {
                                        floorMeshes: webvrFloorMeshes,
                                        optionalFeatures: this.immersiveOptions.optionalFeatures,
                                        useStablePlugins: this.immersiveOptions.useStablePlugins,
                                        renderingGroupId: this.immersiveOptions.renderingGroupNum,
                                        disableDefaultUI: this.immersiveOptions.disableUserInterface,
                                        disableTeleportation: (this.immersiveOptions.defaultTeleportationSetup.useTeleportation === false),
                                        disablePointerSelection: this.immersiveOptions.disablePointerSelect,
                                        ignoreNativeCameraTransformation: this.immersiveOptions.ignoreNativeCamera,
                                        inputOptions: {
                                            doNotLoadControllerMeshes: this.immersiveOptions.experienceInputOptions.disableMeshLoad,
                                            forceInputProfile: this.immersiveOptions.experienceInputOptions.forceInputProfile,
                                            disableOnlineControllerRepository: this.immersiveOptions.experienceInputOptions.disableRepository,
                                            customControllersRepositoryURL: this.immersiveOptions.experienceInputOptions.customRepository,
                                            disableControllerAnimation: this.immersiveOptions.experienceInputOptions.disableModelAnim,
                                            controllerOptions: {
                                                disableMotionControllerAnimation: this.immersiveOptions.experienceInputOptions.controllerOptions.disableCtrlAnim,
                                                doNotLoadControllerMesh: this.immersiveOptions.experienceInputOptions.controllerOptions.disableCtrlMesh,
                                                forceControllerProfile: this.immersiveOptions.experienceInputOptions.controllerOptions.forceCtrlProfile,
                                                renderingGroupId: this.immersiveOptions.experienceInputOptions.controllerOptions.renderingGroup
                                            }
                                        },
                                        uiOptions: {
                                            sessionMode: webvrImmersiveMode,
                                            referenceSpaceType: webvrReferenceType
                                        }
                                    };
                                }
                                else {
                                    webvrHelperOptions = {
                                        optionalFeatures: this.immersiveOptions.optionalFeatures,
                                        useStablePlugins: this.immersiveOptions.useStablePlugins,
                                        renderingGroupId: this.immersiveOptions.renderingGroupNum,
                                        disableDefaultUI: this.immersiveOptions.disableUserInterface,
                                        disableTeleportation: (this.immersiveOptions.defaultTeleportationSetup.useTeleportation === false),
                                        disablePointerSelection: this.immersiveOptions.disablePointerSelect,
                                        ignoreNativeCameraTransformation: this.immersiveOptions.ignoreNativeCamera,
                                        inputOptions: {
                                            doNotLoadControllerMeshes: this.immersiveOptions.experienceInputOptions.disableMeshLoad,
                                            forceInputProfile: this.immersiveOptions.experienceInputOptions.forceInputProfile,
                                            disableOnlineControllerRepository: this.immersiveOptions.experienceInputOptions.disableRepository,
                                            customControllersRepositoryURL: this.immersiveOptions.experienceInputOptions.customRepository,
                                            disableControllerAnimation: this.immersiveOptions.experienceInputOptions.disableModelAnim,
                                            controllerOptions: {
                                                disableMotionControllerAnimation: this.immersiveOptions.experienceInputOptions.controllerOptions.disableCtrlAnim,
                                                doNotLoadControllerMesh: this.immersiveOptions.experienceInputOptions.controllerOptions.disableCtrlMesh,
                                                forceControllerProfile: this.immersiveOptions.experienceInputOptions.controllerOptions.forceCtrlProfile,
                                                renderingGroupId: this.immersiveOptions.renderingGroupNum
                                            }
                                        },
                                        uiOptions: {
                                            sessionMode: webvrImmersiveMode,
                                            referenceSpaceType: webvrReferenceType
                                        }
                                    };
                                }
                                PROJECT.DefaultCameraSystem.XRExperienceHelper = yield this.scene.createDefaultXRExperienceAsync(webvrHelperOptions);
                                if (PROJECT.DefaultCameraSystem.XRExperienceHelper != null && PROJECT.DefaultCameraSystem.XRExperienceHelper.baseExperience != null) {
                                    if (PROJECT.DefaultCameraSystem.XRExperienceHelper.teleportation != null) {
                                        PROJECT.DefaultCameraSystem.XRExperienceHelper.teleportation.rotationAngle = BABYLON.Tools.ToRadians(this.immersiveOptions.defaultTeleportationSetup.turningAxisAngle);
                                        PROJECT.DefaultCameraSystem.XRExperienceHelper.teleportation.rotationEnabled = this.immersiveOptions.defaultTeleportationSetup.rotationsEnabled;
                                        PROJECT.DefaultCameraSystem.XRExperienceHelper.teleportation.backwardsMovementEnabled = this.immersiveOptions.defaultTeleportationSetup.backwardsEnabled;
                                        PROJECT.DefaultCameraSystem.XRExperienceHelper.teleportation.backwardsTeleportationDistance = this.immersiveOptions.defaultTeleportationSetup.backwardsDistance;
                                        PROJECT.DefaultCameraSystem.XRExperienceHelper.teleportation.parabolicCheckRadius = this.immersiveOptions.defaultTeleportationSetup.parabolicRadius;
                                    }
                                    if (PROJECT.DefaultCameraSystem.OnXRExperienceHelperObservable && PROJECT.DefaultCameraSystem.OnXRExperienceHelperObservable.hasObservers()) {
                                        PROJECT.DefaultCameraSystem.OnXRExperienceHelperObservable.notifyObservers(PROJECT.DefaultCameraSystem.XRExperienceHelper);
                                    }
                                    if (UNITY.SceneManager.HasNavigationData()) {
                                        const navmesh = UNITY.SceneManager.GetNavigationMesh();
                                        PROJECT.DefaultCameraSystem.SetupNavigationWebXR(navmesh, this.immersiveOptions.setFloorMeshesTags);
                                    }
                                    else {
                                        UNITY.SceneManager.OnNavMeshReadyObservable.addOnce((navmesh) => {
                                            PROJECT.DefaultCameraSystem.SetupNavigationWebXR(navmesh, this.immersiveOptions.setFloorMeshesTags);
                                        });
                                    }
                                }
                                else {
                                    UNITY.SceneManager.LogWarning("WebXR not supported in current browser.");
                                }
                            }
                        }
                    }
                    else if (this.cameraType === 3) { // Multi Player Camera
                        const cameraName = this.m_cameraRig.name;
                        //if (PROJECT.DefaultCameraSystem.PlayerOneCamera == null) {
                        const playerOneTransform = new BABYLON.TransformNode("Player Camera 1", this.scene);
                        playerOneTransform.rotationQuaternion = this.transform.rotationQuaternion.clone();
                        playerOneTransform.position = this.transform.position.clone();
                        playerOneTransform.parent = this.transform.parent;
                        // ..
                        const playerOneName = cameraName + ".1";
                        const playerOneCamerax = this.m_cameraRig.clone(playerOneName);
                        playerOneCamerax.name = playerOneName;
                        playerOneCamerax.parent = playerOneTransform;
                        playerOneCamerax.position = new BABYLON.Vector3(0, 0, 0);
                        playerOneCamerax.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                        playerOneCamerax.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                        playerOneCamerax.setEnabled(false);
                        PROJECT.DefaultCameraSystem.PlayerOneCamera = playerOneCamerax;
                        PROJECT.DefaultCameraSystem.PlayerOneCamera.inertia = this.cameraInertia;
                        PROJECT.DefaultCameraSystem.PlayerOneCamera.transform = playerOneTransform;
                        playerOneTransform.cameraRig = PROJECT.DefaultCameraSystem.PlayerOneCamera;
                        //}             
                        //if (PROJECT.DefaultCameraSystem.PlayerTwoCamera == null) {
                        const playerTwoTransform = new BABYLON.TransformNode("Player Camera 2", this.scene);
                        playerTwoTransform.rotationQuaternion = this.transform.rotationQuaternion.clone();
                        playerTwoTransform.position = this.transform.position.clone();
                        playerTwoTransform.parent = this.transform.parent;
                        // ..
                        const playerTwoName = cameraName + ".2";
                        const playerTwoCamerax = this.m_cameraRig.clone(playerTwoName);
                        playerTwoCamerax.name = playerTwoName;
                        playerTwoCamerax.parent = playerTwoTransform;
                        playerTwoCamerax.position = new BABYLON.Vector3(0, 0, 0);
                        playerTwoCamerax.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                        playerTwoCamerax.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                        playerTwoCamerax.setEnabled(false);
                        PROJECT.DefaultCameraSystem.PlayerTwoCamera = playerTwoCamerax;
                        PROJECT.DefaultCameraSystem.PlayerTwoCamera.inertia = this.cameraInertia;
                        PROJECT.DefaultCameraSystem.PlayerTwoCamera.transform = playerTwoTransform;
                        playerTwoTransform.cameraRig = PROJECT.DefaultCameraSystem.PlayerTwoCamera;
                        //}
                        //if (PROJECT.DefaultCameraSystem.PlayerThreeCamera == null) {
                        const playerThreeTransform = new BABYLON.TransformNode("Player Camera 3", this.scene);
                        playerThreeTransform.rotationQuaternion = this.transform.rotationQuaternion.clone();
                        playerThreeTransform.position = this.transform.position.clone();
                        playerThreeTransform.parent = this.transform.parent;
                        // ..
                        const playerThreeName = cameraName + ".3";
                        const playerThreeCamerax = this.m_cameraRig.clone(playerThreeName);
                        playerThreeCamerax.name = playerThreeName;
                        playerThreeCamerax.parent = playerThreeTransform;
                        playerThreeCamerax.position = new BABYLON.Vector3(0, 0, 0);
                        playerThreeCamerax.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                        playerThreeCamerax.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                        playerThreeCamerax.setEnabled(false);
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera = playerThreeCamerax;
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.inertia = this.cameraInertia;
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.transform = playerThreeTransform;
                        playerThreeTransform.cameraRig = PROJECT.DefaultCameraSystem.PlayerThreeCamera;
                        //}
                        //if (PROJECT.DefaultCameraSystem.PlayerFourCamera == null) {
                        const playerFourTransform = new BABYLON.TransformNode("Player Camera 4", this.scene);
                        playerFourTransform.rotationQuaternion = this.transform.rotationQuaternion.clone();
                        playerFourTransform.position = this.transform.position.clone();
                        playerFourTransform.parent = this.transform.parent;
                        // ..
                        const playerFourName = cameraName + ".4";
                        const playerFourCamerax = this.m_cameraRig.clone(playerFourName);
                        playerFourCamerax.name = playerFourName;
                        playerFourCamerax.parent = playerFourTransform;
                        playerFourCamerax.position = new BABYLON.Vector3(0, 0, 0);
                        playerFourCamerax.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                        playerFourCamerax.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                        playerFourCamerax.setEnabled(false);
                        PROJECT.DefaultCameraSystem.PlayerFourCamera = playerFourCamerax;
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.inertia = this.cameraInertia;
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.transform = playerFourTransform;
                        playerFourTransform.cameraRig = PROJECT.DefaultCameraSystem.PlayerFourCamera;
                        //}
                        PROJECT.DefaultCameraSystem.multiPlayerView = true;
                        PROJECT.DefaultCameraSystem.SetMultiPlayerViewLayout(this.scene, PROJECT.DefaultCameraSystem.startupMode);
                    }
                    // ..
                    // Validate Camera Attach Control
                    // ..
                    if (this.cameraController.attachControl === true) {
                        this.m_cameraRig.parent = null; // Detach Camera Parent When Attaching Control
                        this.m_cameraRig.position.copyFrom(this.transform.position);
                        this.m_cameraRig.rotationQuaternion = (this.transform.rotationQuaternion != null) ? this.transform.rotationQuaternion.clone() : BABYLON.Quaternion.FromEulerAngles(this.transform.rotation.x, this.transform.rotation.y, this.transform.rotation.z);
                        const children = this.transform.getChildren(null, true);
                        if (children != null) {
                            children.forEach((child) => { child.parent = this.m_cameraRig; });
                        }
                        if (this.m_cameraRig instanceof BABYLON.FreeCamera) { // Note: Check Base Class For Universal Camera
                            this.m_cameraRig.checkCollisions = this.cameraController.checkCollisions;
                            this.m_cameraRig.applyGravity = this.cameraController.setApplyGravity;
                        }
                        this.m_cameraRig.attachControl(this.cameraController.preventDefault);
                    }
                }
                const quality = UNITY.RenderQuality.High; // FIXME: UNITY.SceneManager.GetRenderQuality();
                const allowProcessing = (quality === UNITY.RenderQuality.High);
                //if (PROJECT.DefaultCameraSystem.renderingPipeline == null) {
                if (allowProcessing === true && this.editorPostProcessing != null && this.editorPostProcessing.usePostProcessing === true) {
                    PROJECT.DefaultCameraSystem.renderingPipeline = new BABYLON.DefaultRenderingPipeline("DefaultCameraSystem", this.editorPostProcessing.highDynamicRange, this.scene, this.scene.cameras, true);
                    if (PROJECT.DefaultCameraSystem.renderingPipeline.isSupported === true) {
                        const defaultPipeline = PROJECT.DefaultCameraSystem.renderingPipeline;
                        defaultPipeline.samples = this.editorPostProcessing.screenAntiAliasing.msaaSamples; // 1 by default (MSAA)
                        /* Image Processing */
                        defaultPipeline.imageProcessingEnabled = this.editorPostProcessing.imageProcessingConfig.imageProcessing; //true by default
                        if (defaultPipeline.imageProcessingEnabled) {
                            defaultPipeline.imageProcessing.contrast = this.editorPostProcessing.imageProcessingConfig.imageContrast; // 1 by default
                            defaultPipeline.imageProcessing.exposure = this.editorPostProcessing.imageProcessingConfig.imageExposure; // 1 by default
                            defaultPipeline.imageProcessing.toneMappingEnabled = this.editorPostProcessing.imageProcessingConfig.toneMapping; // false by default
                            defaultPipeline.imageProcessing.toneMappingType = this.editorPostProcessing.imageProcessingConfig.toneMapType; // standard by default
                            defaultPipeline.imageProcessing.vignetteEnabled = this.editorPostProcessing.imageProcessingConfig.vignetteEnabled;
                            if (defaultPipeline.imageProcessing.vignetteEnabled) {
                                defaultPipeline.imageProcessing.vignetteBlendMode = this.editorPostProcessing.imageProcessingConfig.vignetteBlendMode;
                                defaultPipeline.imageProcessing.vignetteCameraFov = this.editorPostProcessing.imageProcessingConfig.vignetteCameraFov;
                                defaultPipeline.imageProcessing.vignetteCentreX = this.editorPostProcessing.imageProcessingConfig.vignetteCentreX;
                                defaultPipeline.imageProcessing.vignetteCentreY = this.editorPostProcessing.imageProcessingConfig.vignetteCentreY;
                                defaultPipeline.imageProcessing.vignetteStretch = this.editorPostProcessing.imageProcessingConfig.vignetteStretch;
                                defaultPipeline.imageProcessing.vignetteWeight = this.editorPostProcessing.imageProcessingConfig.vignetteWeight;
                                if (this.editorPostProcessing.imageProcessingConfig.vignetteColor != null) {
                                    const vcolor = UNITY.Utilities.ParseColor4(this.editorPostProcessing.imageProcessingConfig.vignetteColor);
                                    if (vcolor != null)
                                        defaultPipeline.imageProcessing.vignetteColor = vcolor;
                                }
                            }
                            /* Color Grading */
                            defaultPipeline.imageProcessing.colorGradingEnabled = this.editorPostProcessing.imageProcessingConfig.useColorGrading; // false by default
                            if (defaultPipeline.imageProcessing.colorGradingEnabled) {
                                // KEEP FOR REFERENCE
                                /* using .3dl (best) : defaultPipeline.imageProcessing.colorGradingTexture = new BABYLON.ColorGradingTexture("textures/LateSunset.3dl", this.scene); */
                                /* using .png :
                                var colorGradingTexture = new BABYLON.Texture("textures/colorGrade-highContrast.png", this.scene, true, false);
                                colorGradingTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
                                colorGradingTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
                                defaultPipeline.imageProcessing.colorGradingTexture = colorGradingTexture;
                                defaultPipeline.imageProcessing.colorGradingWithGreenDepth = false; */
                                //////////////////////////////////////////////////////////////////////////
                                if (this.editorPostProcessing.imageProcessingConfig.setGradingTexture != null) {
                                    const colorGradingTexture = UNITY.Utilities.ParseTexture(this.editorPostProcessing.imageProcessingConfig.setGradingTexture, this.scene, true, false);
                                    colorGradingTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
                                    colorGradingTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
                                    defaultPipeline.imageProcessing.colorGradingTexture = colorGradingTexture;
                                    defaultPipeline.imageProcessing.colorGradingWithGreenDepth = false;
                                }
                            }
                            /* Color Curves */
                            defaultPipeline.imageProcessing.colorCurvesEnabled = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.curvesEnabled; // false by default
                            if (defaultPipeline.imageProcessing.colorCurvesEnabled) {
                                var curve = new BABYLON.ColorCurves();
                                curve.globalDensity = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.globalDen; // 0 by default
                                curve.globalExposure = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.globalExp; // 0 by default
                                curve.globalHue = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.globalHue; // 30 by default
                                curve.globalSaturation = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.globalSat; // 0 by default
                                curve.highlightsDensity = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.highlightsDen; // 0 by default
                                curve.highlightsExposure = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.highlightsExp; // 0 by default
                                curve.highlightsHue = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.highlightsHue; // 30 by default
                                curve.highlightsSaturation = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.highlightsSat; // 0 by default
                                curve.midtonesDensity = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.midtonesDen; // 0 by default
                                curve.midtonesExposure = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.midtonesExp; // 0 by default
                                curve.midtonesHue = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.midtonesHue; // 30 by default
                                curve.midtonesSaturation = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.midtonesSat; // 0 by default
                                curve.shadowsDensity = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.shadowsDen; // 0 by default
                                curve.shadowsExposure = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.shadowsExp; // 800 by default
                                curve.shadowsHue = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.shadowsHue; // 30 by default
                                curve.shadowsSaturation = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.shadowsSat; // 0 by default;
                                defaultPipeline.imageProcessing.colorCurves = curve;
                            }
                        }
                        /* Bloom */
                        defaultPipeline.bloomEnabled = this.editorPostProcessing.bloomEffectProperties.bloomEnabled; // false by default
                        if (defaultPipeline.bloomEnabled) {
                            defaultPipeline.bloomKernel = this.editorPostProcessing.bloomEffectProperties.bloomKernel; // 64 by default
                            defaultPipeline.bloomScale = this.editorPostProcessing.bloomEffectProperties.bloomScale; // 0.5 by default
                            defaultPipeline.bloomWeight = this.editorPostProcessing.bloomEffectProperties.bloomWeight; // 0.15 by default
                            defaultPipeline.bloomThreshold = this.editorPostProcessing.bloomEffectProperties.bloomThreshold; // 0.9 by default
                        }
                        /* Chromatic Abberation */
                        defaultPipeline.chromaticAberrationEnabled = this.editorPostProcessing.chromaticAberration.aberrationEnabled; // false by default
                        if (defaultPipeline.chromaticAberrationEnabled) {
                            defaultPipeline.chromaticAberration.aberrationAmount = this.editorPostProcessing.chromaticAberration.aberrationAmount; // 30 by default
                            defaultPipeline.chromaticAberration.adaptScaleToCurrentViewport = this.editorPostProcessing.chromaticAberration.adaptScaleViewport; // false by default
                            defaultPipeline.chromaticAberration.alphaMode = this.editorPostProcessing.chromaticAberration.alphaMode; // 0 by default
                            defaultPipeline.chromaticAberration.alwaysForcePOT = this.editorPostProcessing.chromaticAberration.alwaysForcePOT; // false by default
                            defaultPipeline.chromaticAberration.enablePixelPerfectMode = this.editorPostProcessing.chromaticAberration.pixelPerfectMode; // false by default
                            defaultPipeline.chromaticAberration.forceFullscreenViewport = this.editorPostProcessing.chromaticAberration.fullscreenViewport; // true by default
                        }
                        /* DOF */
                        defaultPipeline.depthOfFieldEnabled = this.editorPostProcessing.focalDepthOfField.depthOfField; // false by default
                        if (defaultPipeline.depthOfFieldEnabled && defaultPipeline.depthOfField.isSupported) {
                            defaultPipeline.depthOfFieldBlurLevel = this.editorPostProcessing.focalDepthOfField.blurLevel; // 0 by default
                            defaultPipeline.depthOfField.fStop = this.editorPostProcessing.focalDepthOfField.focalStop; // 1.4 by default
                            defaultPipeline.depthOfField.focalLength = this.editorPostProcessing.focalDepthOfField.focalLength; // 50 by default, mm
                            defaultPipeline.depthOfField.focusDistance = this.editorPostProcessing.focalDepthOfField.focusDistance; // 2000 by default, mm
                            defaultPipeline.depthOfField.lensSize = this.editorPostProcessing.focalDepthOfField.maxLensSize; // 50 by default
                        }
                        /* FXAA */
                        defaultPipeline.fxaaEnabled = this.editorPostProcessing.screenAntiAliasing.fxaaEnabled; // false by default
                        if (defaultPipeline.fxaaEnabled) {
                            defaultPipeline.fxaa.samples = this.editorPostProcessing.screenAntiAliasing.fxaaSamples; // 1 by default
                            defaultPipeline.fxaa.adaptScaleToCurrentViewport = this.editorPostProcessing.screenAntiAliasing.fxaaScaling; // false by default
                        }
                        /* GlowLayer */
                        defaultPipeline.glowLayerEnabled = this.editorPostProcessing.glowLayerProperties.glowEnabled;
                        if (defaultPipeline.glowLayerEnabled) {
                            defaultPipeline.glowLayer.intensity = this.editorPostProcessing.glowLayerProperties.glowIntensity; // 1 by default
                            defaultPipeline.glowLayer.blurKernelSize = this.editorPostProcessing.glowLayerProperties.blurKernelSize; // 16 by default
                        }
                        /* Grain */
                        defaultPipeline.grainEnabled = this.editorPostProcessing.grainEffectProperties.grainEnabled;
                        if (defaultPipeline.grainEnabled) {
                            defaultPipeline.grain.animated = this.editorPostProcessing.grainEffectProperties.grainAnimated; // false by default
                            defaultPipeline.grain.intensity = this.editorPostProcessing.grainEffectProperties.grainIntensity; // 30 by default
                            defaultPipeline.grain.adaptScaleToCurrentViewport = this.editorPostProcessing.grainEffectProperties.adaptScaleViewport; // false by default
                        }
                        /* Sharpen */
                        defaultPipeline.sharpenEnabled = this.editorPostProcessing.sharpEffectProperties.sharpenEnabled;
                        if (defaultPipeline.sharpenEnabled) {
                            defaultPipeline.sharpen.edgeAmount = this.editorPostProcessing.sharpEffectProperties.sharpEdgeAmount; // 0.3 by default
                            defaultPipeline.sharpen.colorAmount = this.editorPostProcessing.sharpEffectProperties.sharpColorAmount; // 1 by default
                            defaultPipeline.sharpen.adaptScaleToCurrentViewport = this.editorPostProcessing.sharpEffectProperties.adaptScaleViewport; // false by default
                        }
                    }
                    else {
                        UNITY.SceneManager.LogWarning("Babylon.js default rendering pipeline not supported");
                    }
                    // ..
                    // Screen Space Ambient Occlusion
                    // ..
                    if (this.editorPostProcessing.screenSpaceRendering != null && this.editorPostProcessing.screenSpaceRendering.SSAO === true) {
                        const ssaoRatio = {
                            ssaoRatio: this.editorPostProcessing.screenSpaceRendering.SSAORatio, // Ratio of the SSAO post-process, in a lower resolution
                            combineRatio: this.editorPostProcessing.screenSpaceRendering.combineRatio // Ratio of the combine post-process (combines the SSAO and the scene)
                        };
                        PROJECT.DefaultCameraSystem.screenSpacePipeline = new BABYLON.SSAORenderingPipeline("DefaultCameraSystem-SSAO", this.scene, ssaoRatio, this.scene.cameras);
                        if (PROJECT.DefaultCameraSystem.screenSpacePipeline.isSupported === true) {
                            const ssaoPipeline = PROJECT.DefaultCameraSystem.screenSpacePipeline;
                            ssaoPipeline.fallOff = this.editorPostProcessing.screenSpaceRendering.fallOff;
                            ssaoPipeline.area = this.editorPostProcessing.screenSpaceRendering.area;
                            ssaoPipeline.radius = this.editorPostProcessing.screenSpaceRendering.radius;
                            ssaoPipeline.totalStrength = this.editorPostProcessing.screenSpaceRendering.totalStrength;
                            ssaoPipeline.base = this.editorPostProcessing.screenSpaceRendering.baseValue;
                        }
                        else {
                            UNITY.SceneManager.LogWarning("Babylon.js SSAO rendering pipeline not supported");
                        }
                    }
                }
                //}
                PROJECT.DefaultCameraSystem.cameraReady = true;
            });
        }
        updateCameraSystemState() {
            if (this.m_cameraRig != null) {
                if (this.cameraType === 0) { // Default Universal Camera
                }
                else if (this.cameraType === 1) { // Augmented Reality Camera
                }
                else if (this.cameraType === 2) { // Virtual Reality Camera
                }
                else if (this.cameraType === 3) { // Multi Player Camera
                }
            }
        }
        cleanCameraSystemState() {
            if (PROJECT.DefaultCameraSystem.PlayerOneCamera != null) {
                //PROJECT.DefaultCameraSystem.PlayerOneCamera.dispose();
                PROJECT.DefaultCameraSystem.PlayerOneCamera = null;
            }
            if (PROJECT.DefaultCameraSystem.PlayerTwoCamera != null) {
                //PROJECT.DefaultCameraSystem.PlayerTwoCamera.dispose();
                PROJECT.DefaultCameraSystem.PlayerTwoCamera = null;
            }
            if (PROJECT.DefaultCameraSystem.PlayerThreeCamera != null) {
                //PROJECT.DefaultCameraSystem.PlayerThreeCamera.dispose();
                PROJECT.DefaultCameraSystem.PlayerThreeCamera = null;
            }
            if (PROJECT.DefaultCameraSystem.PlayerFourCamera != null) {
                //PROJECT.DefaultCameraSystem.PlayerFourCamera.dispose();
                PROJECT.DefaultCameraSystem.PlayerFourCamera = null;
            }
        }
        destroyCameraSystemState() {
            this.immersiveOptions = null;
        }
        ////////////////////////////////////////////////////////////////////////////////////
        // Universal Camera Virtual Reality Functions
        ////////////////////////////////////////////////////////////////////////////////////
        /** Get the WebXR default experience helper */
        static GetWebXR() { return PROJECT.DefaultCameraSystem.XRExperienceHelper; }
        /** Is universal camera system in WebXR mode */
        static IsInWebXR() { return (PROJECT.DefaultCameraSystem.XRExperienceHelper != null && PROJECT.DefaultCameraSystem.XRExperienceHelper.baseExperience != null && PROJECT.DefaultCameraSystem.XRExperienceHelper.baseExperience.state === BABYLON.WebXRState.IN_XR); }
        /** Setup navigation mesh for WebXR */
        static SetupNavigationWebXR(mesh, tag) {
            const webxr = PROJECT.DefaultCameraSystem.XRExperienceHelper;
            if (webxr != null && webxr.teleportation != null && mesh != null && tag != null && tag != "") {
                const hastag = BABYLON.Tags.MatchesQuery(mesh, tag);
                if (hastag === true)
                    webxr.teleportation.addFloorMesh(mesh);
            }
        }
        ////////////////////////////////////////////////////////////////////////////////////
        // Universal Camera System Player Functions
        ////////////////////////////////////////////////////////////////////////////////////
        /** Get main camera rig for the scene */
        static GetMainCamera(scene, detach = false) {
            return PROJECT.DefaultCameraSystem.GetPlayerCamera(scene, UNITY.PlayerNumber.One, detach);
        }
        /** Get universal camera rig for desired player */
        static GetPlayerCamera(scene, player = UNITY.PlayerNumber.One, detach = false) {
            let result = null;
            let transform = PROJECT.DefaultCameraSystem.GetCameraTransform(scene, player);
            if (PROJECT.DefaultCameraSystem.IsCameraSystemReady()) {
                if (player === UNITY.PlayerNumber.One && PROJECT.DefaultCameraSystem.PlayerOneCamera != null)
                    result = PROJECT.DefaultCameraSystem.PlayerOneCamera;
                else if (player === UNITY.PlayerNumber.Two && PROJECT.DefaultCameraSystem.PlayerTwoCamera != null)
                    result = PROJECT.DefaultCameraSystem.PlayerTwoCamera;
                else if (player === UNITY.PlayerNumber.Three && PROJECT.DefaultCameraSystem.PlayerThreeCamera != null)
                    result = PROJECT.DefaultCameraSystem.PlayerThreeCamera;
                else if (player === UNITY.PlayerNumber.Four && PROJECT.DefaultCameraSystem.PlayerFourCamera != null)
                    result = PROJECT.DefaultCameraSystem.PlayerFourCamera;
                if (result != null && detach === true && parent != null) {
                    result.parent = null;
                    if (transform != null) {
                        result.position.copyFrom(transform.position);
                        result.rotationQuaternion = (transform.rotationQuaternion != null) ? transform.rotationQuaternion.clone() : BABYLON.Quaternion.FromEulerAngles(transform.rotation.x, transform.rotation.y, transform.rotation.z);
                        const children = transform.getChildren(null, true);
                        if (children != null) {
                            children.forEach((child) => { child.parent = result; });
                        }
                    }
                }
            }
            return result;
        }
        /** Get camera transform node for desired player */
        static GetCameraTransform(scene, player = UNITY.PlayerNumber.One) {
            let result = null;
            if (PROJECT.DefaultCameraSystem.IsCameraSystemReady()) {
                if (player === UNITY.PlayerNumber.One && PROJECT.DefaultCameraSystem.PlayerOneCamera != null && PROJECT.DefaultCameraSystem.PlayerOneCamera.transform != null)
                    result = PROJECT.DefaultCameraSystem.PlayerOneCamera.transform;
                else if (player === UNITY.PlayerNumber.Two && PROJECT.DefaultCameraSystem.PlayerTwoCamera != null && PROJECT.DefaultCameraSystem.PlayerTwoCamera.transform != null)
                    result = PROJECT.DefaultCameraSystem.PlayerTwoCamera.transform;
                else if (player === UNITY.PlayerNumber.Three && PROJECT.DefaultCameraSystem.PlayerThreeCamera != null && PROJECT.DefaultCameraSystem.PlayerThreeCamera.transform != null)
                    result = PROJECT.DefaultCameraSystem.PlayerThreeCamera.transform;
                else if (player === UNITY.PlayerNumber.Four && PROJECT.DefaultCameraSystem.PlayerFourCamera != null && PROJECT.DefaultCameraSystem.PlayerFourCamera.transform != null)
                    result = PROJECT.DefaultCameraSystem.PlayerFourCamera.transform;
            }
            return result;
        }
        ////////////////////////////////////////////////////////////////////////////////////
        // Universal Camera System Multi Player Functions
        ////////////////////////////////////////////////////////////////////////////////////
        /** Are stereo side side camera services available. */
        static IsStereoCameras() {
            return PROJECT.DefaultCameraSystem.stereoCameras;
        }
        /** Are local multi player view services available. */
        static IsMultiPlayerView() {
            return PROJECT.DefaultCameraSystem.multiPlayerView;
        }
        /** Get the current local multi player count */
        static GetMultiPlayerCount() {
            return PROJECT.DefaultCameraSystem.multiPlayerCount;
        }
        /** Activates current local multi player cameras. */
        static ActivateMultiPlayerCameras(scene) {
            let result = false;
            if (PROJECT.DefaultCameraSystem.multiPlayerCameras != null && PROJECT.DefaultCameraSystem.multiPlayerCameras.length > 0) {
                scene.activeCameras = PROJECT.DefaultCameraSystem.multiPlayerCameras;
                result = true;
            }
            return result;
        }
        /** Disposes current local multiplayer cameras */
        static DisposeMultiPlayerCameras() {
            if (PROJECT.DefaultCameraSystem.PlayerOneCamera != null) {
                PROJECT.DefaultCameraSystem.PlayerOneCamera.dispose();
                PROJECT.DefaultCameraSystem.PlayerOneCamera = null;
            }
            if (PROJECT.DefaultCameraSystem.PlayerTwoCamera != null) {
                PROJECT.DefaultCameraSystem.PlayerTwoCamera.dispose();
                PROJECT.DefaultCameraSystem.PlayerTwoCamera = null;
            }
            if (PROJECT.DefaultCameraSystem.PlayerThreeCamera != null) {
                PROJECT.DefaultCameraSystem.PlayerThreeCamera.dispose();
                PROJECT.DefaultCameraSystem.PlayerThreeCamera = null;
            }
            if (PROJECT.DefaultCameraSystem.PlayerFourCamera != null) {
                PROJECT.DefaultCameraSystem.PlayerFourCamera.dispose();
                PROJECT.DefaultCameraSystem.PlayerFourCamera = null;
            }
        }
        /** Sets the multi player camera view layout */
        static SetMultiPlayerViewLayout(scene, totalNumPlayers) {
            let result = false;
            let players = BABYLON.Scalar.Clamp(totalNumPlayers, 1, 4);
            if (PROJECT.DefaultCameraSystem.IsMultiPlayerView()) {
                if (PROJECT.DefaultCameraSystem.PlayerOneCamera != null && PROJECT.DefaultCameraSystem.PlayerTwoCamera != null && PROJECT.DefaultCameraSystem.PlayerThreeCamera != null && PROJECT.DefaultCameraSystem.PlayerFourCamera != null) {
                    PROJECT.DefaultCameraSystem.multiPlayerCameras = [];
                    if (players === 1) {
                        PROJECT.DefaultCameraSystem.PlayerOneCamera.viewport = new BABYLON.Viewport(0, 0, 1, 1);
                        PROJECT.DefaultCameraSystem.PlayerTwoCamera.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                        PROJECT.DefaultCameraSystem.PlayerTwoCamera.setEnabled(false);
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.setEnabled(false);
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.setEnabled(false);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerOneCamera);
                    }
                    else if (players === 2) {
                        if (PROJECT.DefaultCameraSystem.stereoCameras === true) {
                            PROJECT.DefaultCameraSystem.PlayerOneCamera.viewport = new BABYLON.Viewport(0, 0, 0.5, 1);
                            PROJECT.DefaultCameraSystem.PlayerTwoCamera.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 1);
                        }
                        else {
                            PROJECT.DefaultCameraSystem.PlayerOneCamera.viewport = new BABYLON.Viewport(0, 0.5, 1, 0.5);
                            PROJECT.DefaultCameraSystem.PlayerTwoCamera.viewport = new BABYLON.Viewport(0, 0, 1, 0.5);
                        }
                        PROJECT.DefaultCameraSystem.PlayerTwoCamera.setEnabled(true);
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.setEnabled(false);
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.setEnabled(false);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerOneCamera);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerTwoCamera);
                    }
                    else if (players === 3) {
                        PROJECT.DefaultCameraSystem.PlayerOneCamera.viewport = new BABYLON.Viewport(0, 0, 0.5, 1);
                        PROJECT.DefaultCameraSystem.PlayerTwoCamera.viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5);
                        PROJECT.DefaultCameraSystem.PlayerTwoCamera.setEnabled(true);
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 0.5);
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.setEnabled(true);
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.setEnabled(false);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerOneCamera);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerTwoCamera);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerThreeCamera);
                    }
                    else if (players === 4) {
                        PROJECT.DefaultCameraSystem.PlayerOneCamera.viewport = new BABYLON.Viewport(0, 0.5, 0.5, 0.5);
                        PROJECT.DefaultCameraSystem.PlayerTwoCamera.viewport = new BABYLON.Viewport(0, 0, 0.5, 0.5);
                        PROJECT.DefaultCameraSystem.PlayerTwoCamera.setEnabled(true);
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5);
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.setEnabled(true);
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 0.5);
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.setEnabled(true);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerOneCamera);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerTwoCamera);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerThreeCamera);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerFourCamera);
                    }
                    else {
                        UNITY.SceneManager.LogWarning("Babylon.js camera rig invalid player count specified: " + players);
                    }
                }
                else {
                    UNITY.SceneManager.LogWarning("Babylon.js camera rig failed to initialize multi player cameras");
                }
                PROJECT.DefaultCameraSystem.multiPlayerCount = players;
                result = PROJECT.DefaultCameraSystem.ActivateMultiPlayerCameras(scene);
                if (result === false)
                    UNITY.SceneManager.LogWarning("Babylon.js camera rig failed to initialize multi player views");
            }
            else {
                UNITY.SceneManager.LogWarning("Babylon.js camera rig multi player view option not enabled");
            }
            return result;
        }
    }
    DefaultCameraSystem.PlayerOneCamera = null;
    DefaultCameraSystem.PlayerTwoCamera = null;
    DefaultCameraSystem.PlayerThreeCamera = null;
    DefaultCameraSystem.PlayerFourCamera = null;
    DefaultCameraSystem.XRExperienceHelper = null;
    DefaultCameraSystem.multiPlayerView = false;
    DefaultCameraSystem.multiPlayerCount = 1;
    DefaultCameraSystem.multiPlayerCameras = null;
    DefaultCameraSystem.stereoCameras = true;
    DefaultCameraSystem.startupMode = 1;
    DefaultCameraSystem.cameraReady = false;
    DefaultCameraSystem.renderingPipeline = null;
    DefaultCameraSystem.screenSpacePipeline = null;
    /** Register handler that is triggered when the webxr experience helper has been created */
    DefaultCameraSystem.OnXRExperienceHelperObservable = new BABYLON.Observable();
    PROJECT.DefaultCameraSystem = DefaultCameraSystem;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
     * Babylon Script Component
     * @class DebugInformation
     */
    class DebugInformation extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.keys = true;
            this.show = true;
            this.popup = false;
            this.views = false;
            this.xbox = false;
            this.color = BABYLON.Color3.Green();
        }
        awake() {
            this.keys = this.getProperty("enableDebugKeys", this.keys);
            this.show = this.getProperty("showDebugLabels", this.show);
            this.popup = this.getProperty("popupDebugPanel", this.popup);
            this.views = this.getProperty("togglePlayerViews", this.views);
            this.xbox = this.getProperty("allowXboxLiveSignIn", this.xbox);
            // ..
            const debugLabelColor = this.getProperty("debugOutputTextColor");
            if (debugLabelColor != null)
                this.color = UNITY.Utilities.ParseColor3(debugLabelColor);
            // ..
            if (UNITY.WindowManager.IsWindows())
                this.popup = false;
            UNITY.SceneManager.LogMessage("Debug information overlay loaded");
        }
        start() {
            //this.screen = document.getElementById("screen");
            //this.toggle = document.getElementById("toggle");
            //this.signin = document.getElementById("signin");
            //this.reload = document.getElementById("reload");
            //this.mouse = document.getElementById("mouse");
            //this.debug = document.getElementById("debug");
            if (this.show === true) {
                /*
                if (this.keys === true) {
                    if (!UNITY.SceneManager.IsXboxOne()) {
                        if (this.screen) this.screen.innerHTML = "F - Show Full Screen";
                    }
                    if (BABYLON.CameraSystem.IsMultiPlayerView() && this.views === true) {
                        if (this.toggle) {
                            if (UNITY.SceneManager.IsXboxOne()) {
                                this.toggle.style.top = "29px";
                            }
                            this.toggle.innerHTML = "1 - 4 Toggle Player View";
                        }
                    }
                    if (UNITY.SceneManager.IsXboxLivePluginEnabled() && this.xbox === true) {
                        if (this.signin) {
                            if (UNITY.SceneManager.IsXboxOne()) {
                                this.signin.style.top = "49px";
                            }
                            this.signin.innerHTML = "X - Xbox Live Sign In";
                        }
                    }
                    if (this.mouse) this.mouse.innerHTML = (UNITY.SceneManager.IsXboxOne()) ? "M - Mouse" : "";
                    if (this.reload) this.reload.innerHTML = "R - Reload";
                    if (this.debug) this.debug.innerHTML = "P - Debug";
                }
                */
            }
            if (this.keys === true) {
                if (this.views === true) {
                    UNITY.SceneManager.LogMessage("Enable Multiplayer Keys");
                    UNITY.InputController.OnKeyboardPress(UNITY.UserInputKey.Num1, () => {
                        PROJECT.DefaultCameraSystem.SetMultiPlayerViewLayout(this.scene, 1);
                        UNITY.SceneManager.LogMessage("1 player pressed");
                    });
                    UNITY.InputController.OnKeyboardPress(UNITY.UserInputKey.Num2, () => {
                        PROJECT.DefaultCameraSystem.SetMultiPlayerViewLayout(this.scene, 2);
                        UNITY.SceneManager.LogMessage("2 players pressed");
                    });
                    UNITY.InputController.OnKeyboardPress(UNITY.UserInputKey.Num3, () => {
                        PROJECT.DefaultCameraSystem.SetMultiPlayerViewLayout(this.scene, 3);
                        UNITY.SceneManager.LogMessage("3 players pressed");
                    });
                    UNITY.InputController.OnKeyboardPress(UNITY.UserInputKey.Num4, () => {
                        PROJECT.DefaultCameraSystem.SetMultiPlayerViewLayout(this.scene, 4);
                        UNITY.SceneManager.LogMessage("4 players pressed");
                    });
                }
                UNITY.InputController.OnKeyboardPress(UNITY.UserInputKey.R, () => {
                    window.location.reload();
                });
                UNITY.InputController.OnKeyboardPress(UNITY.UserInputKey.I, () => {
                    if (this.popup === true) {
                        UNITY.WindowManager.PopupDebug(this.scene);
                    }
                    else {
                        UNITY.WindowManager.ToggleDebug(this.scene, true, null);
                    }
                });
                UNITY.InputController.OnKeyboardPress(UNITY.UserInputKey.F, () => {
                    //UNITY.SceneManager.ToggleFullScreenMode(this.scene);
                });
                /*
                if (UNITY.SceneManager.IsXboxOne()) {
                    if (navigator.gamepadInputEmulation) {
                        UNITY.InputController.OnKeyboardPress(UNITY.UserInputKey.M, ()=>{
                            if (navigator.gamepadInputEmulation !== "mouse") {
                                navigator.gamepadInputEmulation = "mouse";
                            } else {
                                navigator.gamepadInputEmulation = "gamepad";
                            }
                        });
                    }
                } else {
                    UNITY.InputController.OnKeyboardPress(UNITY.UserInputKey.F, ()=>{
                        //BABYLON.Tools.RequestFullscreen(document.documentElement);
                        this.scene.getEngine().enterFullscreen(true);
                    });
                }
                if (BABYLON.WindowsPlatform.IsXboxLivePluginEnabled() && this.xbox === true) {
                    UNITY.InputController.OnKeyboardPress(UNITY.UserInputKey.X, ()=>{
                        var player:UNITY.PlayerNumber.One = UNITY.PlayerNumber.One;
                        if (!BABYLON.WindowsPlatform.IsXboxLiveUserSignedIn(null, player)) {
                            UNITY.SceneManager.LogMessage("===> Trying Xbox Live Sign In For Player: " + player.toString());
                            BABYLON.WindowsPlatform.XboxLiveUserSignIn(player, (result: Microsoft.Xbox.Services.System.SignInResult) => {
                                var user = BABYLON.WindowsPlatform.GetXboxLiveUser(player);
                                var msg = "(" + user.xboxUserId + ") - " + user.gamertag;
                                UNITY.SceneManager.AlertMessage(msg, "Xbox Live User Signed In");
                            }, (err)=>{
                                UNITY.SceneManager.LogMessage(err);
                                var msg:string = "Encountered Sign Error";
                                UNITY.SceneManager.LogWarning(msg);
                                UNITY.SceneManager.AlertMessage(msg, "Xbox Live Warning");
                            });
                        } else {
                            UNITY.SceneManager.LogWarning("Xbox Live User Already Signed In");
                            UNITY.SceneManager.AlertMessage("User Already Signed In", "Xbox Live Warning");
                        }
                    });
                }
                */
            }
            // Default Print To Screen Text
            var printColor = (this.scene.getEngine().webGLVersion < 2) ? "red" : this.color.toHexString();
            var graphicsVersion = UNITY.SceneManager.GetWebGLVersionString(this.scene);
            UNITY.WindowManager.PrintToScreen(graphicsVersion, printColor);
        }
        destroy() {
            //this.screen = null;
            //this.toggle = null;
            //this.signin = null;
            //this.reload = null;
            //this.mouse = null;
            //this.debug = null;
        }
    }
    PROJECT.DebugInformation = DebugInformation;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class UserInterface
    */
    class UserInterface extends UNITY.ScriptComponent {
        static IsCanvasReady() { return (PROJECT.UserInterface.AdvancedTexture != null); }
        static GetCanvasElement(name) { return (PROJECT.UserInterface.AdvancedTexture != null) ? PROJECT.UserInterface.AdvancedTexture.getControlByName(name) : null; }
        static ShowCanvasElement(element, fadeSpeedRatio = 0.0, onAnimationComplete = null) {
            let result = null;
            if (element != null) {
                if (fadeSpeedRatio > 0) {
                    const alphaStart = element.alpha;
                    const alphaEnd = 1.0;
                    element.isEnabled = true;
                    element.alpha = alphaEnd;
                    if (onAnimationComplete != null)
                        onAnimationComplete();
                    //result = UNITY.SceneManager.StartTweenAnimation(PROJECT.UserInterface.SceneController, (element.name + "-ShowAlphaTween"), element, "alpha", alphaStart, alphaEnd, fadeSpeedRatio, null, null, null, ()=>{
                    //    element.isEnabled = true;
                    //    if (onAnimationComplete != null) onAnimationComplete();
                    //});
                }
                else {
                    element.isEnabled = true;
                    element.alpha = 1.0;
                }
            }
            return result;
        }
        static HideCanvasElement(element, fadeSpeedRatio = 0.0, onAnimationComplete = null) {
            let result = null;
            if (element != null) {
                if (fadeSpeedRatio > 0) {
                    element.isEnabled = false;
                    const alphaStart = element.alpha;
                    const alphaEnd = 0.0;
                    element.isEnabled = false;
                    element.alpha = alphaEnd;
                    if (onAnimationComplete != null)
                        onAnimationComplete();
                    //result = UNITY.SceneManager.StartTweenAnimation(PROJECT.UserInterface.SceneController, (element.name + "-HideAlphaTween"), element, "alpha", alphaStart, alphaEnd, fadeSpeedRatio, null, null, null, ()=>{
                    //    if (onAnimationComplete != null) onAnimationComplete();
                    //});
                }
                else {
                    element.isEnabled = false;
                    element.alpha = 0.0;
                }
            }
            return result;
        }
        static SetSceneController(scene) { PROJECT.UserInterface.SceneController = scene; }
        static GetAdvancedTexture() { return PROJECT.UserInterface.AdvancedTexture; }
        static GetBackgroundTexture() { return PROJECT.UserInterface.BackgroundTexture; }
        constructor(transform, scene, properties) {
            super(transform, scene, properties);
            this.exportLowerCase = false;
            this.backgroundData = null;
            this.textureSampleMode = 2;
            this.idealRenderingSize = 0;
            this.viewportRenderSize = 0;
            this.customViewportSize = new BABYLON.Vector2(1920, 1080);
            this.defaultImageLocation = "scenes/assets/";
            this.defaultImageControl = true;
            this.isManagedTexture = true;
            this.scaleTextureSize = true;
            this.setAdaptiveScale = true;
            this.drawAtIdealSize = true;
            this.useSmallestIdeal = false;
            this.fontFamilyList = null;
            PROJECT.UserInterface.SetSceneController(scene);
            this.attachWebFonts();
        }
        awake() {
            this.setupProperties();
            this.preloadWebFonts();
        }
        start() {
            this.setupInterface();
        }
        destroy() {
            PROJECT.UserInterface.OnFontFacesReady.clear();
            PROJECT.UserInterface.OnFontFacesReady = null;
            PROJECT.UserInterface.OnFontFacesLoaded.clear();
            PROJECT.UserInterface.OnFontFacesLoaded = null;
            PROJECT.UserInterface.OnParseNodeObject.clear();
            PROJECT.UserInterface.OnParseNodeObject = null;
            PROJECT.UserInterface.OnInterfaceLoaded.clear();
            PROJECT.UserInterface.OnInterfaceLoaded = null;
            if (this.isManagedTexture === false && PROJECT.UserInterface.AdvancedTexture != null) {
                PROJECT.UserInterface.AdvancedTexture.dispose();
            }
            PROJECT.UserInterface.AdvancedTexture = null;
            if (PROJECT.UserInterface.BackgroundTexture != null) {
                PROJECT.UserInterface.BackgroundTexture.dispose();
            }
            PROJECT.UserInterface.BackgroundTexture = null;
        }
        engineResize() {
            this.scene.getEngine().resize(true); // Note: Force Initial Resize Content
        }
        setupProperties() {
            if (this.defaultImageLocation != null && this.defaultImageLocation !== "") {
                this.defaultImageLocation = this.defaultImageLocation.trim();
            }
            if (this.defaultImageLocation != null && this.defaultImageLocation !== "" && this.defaultImageLocation.endsWith("/") === false) {
                this.defaultImageLocation = (this.defaultImageLocation + "/");
            }
            if (this.customViewportSize.x <= 0)
                this.customViewportSize.x = 1920;
            if (this.customViewportSize.y <= 0)
                this.customViewportSize.y = 1080;
        }
        setupInterface() {
            let interfaceParsed = null;
            let backgroundParsed = null;
            const interfaceText = this.getProperty("base64UserInterface");
            if (interfaceText != null && interfaceText !== "") {
                const interfaceJson = window.atob(interfaceText);
                if (interfaceJson != null && interfaceJson !== "") {
                    interfaceParsed = JSON.parse(interfaceJson);
                    if (interfaceParsed != null) {
                        if (interfaceParsed.root != null) {
                            this.parseNodeObject(interfaceParsed.root);
                        }
                        let width = (this.viewportRenderSize === 0 && interfaceParsed.width !== null && interfaceParsed.width >= 0) ? interfaceParsed.width : this.customViewportSize.x;
                        let height = (this.viewportRenderSize === 0 && interfaceParsed.height !== null && interfaceParsed.height >= 0) ? interfaceParsed.height : this.customViewportSize.y;
                        if (this.viewportRenderSize === 1) {
                            width = this.scene.getEngine().getRenderingCanvas().width;
                            height = this.scene.getEngine().getRenderingCanvas().height;
                        }
                        // ..
                        // Advanced Texture
                        // ..
                        if (this.isManagedTexture === true) {
                            if (UNITY.SceneManager.AdvDynamicTexture == null)
                                UNITY.SceneManager.AdvDynamicTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("Default-Screen-UI", true, this.scene, this.textureSampleMode, this.setAdaptiveScale);
                            PROJECT.UserInterface.AdvancedTexture = UNITY.SceneManager.AdvDynamicTexture;
                        }
                        else {
                            PROJECT.UserInterface.AdvancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, this.scene, this.textureSampleMode, this.setAdaptiveScale);
                        }
                        if (PROJECT.UserInterface.AdvancedTexture != null) {
                            if (this.idealRenderingSize > 0) {
                                if (this.idealRenderingSize === 1 || this.idealRenderingSize === 3) {
                                    PROJECT.UserInterface.AdvancedTexture.idealWidth = width;
                                }
                                if (this.idealRenderingSize === 2 || this.idealRenderingSize === 3) {
                                    PROJECT.UserInterface.AdvancedTexture.idealHeight = height;
                                }
                                if (this.idealRenderingSize === 3) {
                                    PROJECT.UserInterface.AdvancedTexture.useSmallestIdeal = this.useSmallestIdeal;
                                }
                                PROJECT.UserInterface.AdvancedTexture.renderAtIdealSize = this.drawAtIdealSize;
                            }
                            else {
                                PROJECT.UserInterface.AdvancedTexture.useSmallestIdeal = false;
                                PROJECT.UserInterface.AdvancedTexture.renderAtIdealSize = false;
                            }
                            if (this.scaleTextureSize === true) {
                                PROJECT.UserInterface.AdvancedTexture.parseSerializedObject(interfaceParsed, false);
                                PROJECT.UserInterface.AdvancedTexture.scaleTo(width, height);
                            }
                            else {
                                PROJECT.UserInterface.AdvancedTexture.parseSerializedObject(interfaceParsed, false);
                            }
                        }
                        // ..
                        // Background Texture
                        // ..
                        if (this.backgroundData != null && this.backgroundData.createBackground === true) {
                            const backgroundText = this.getProperty("base64BackgroundData");
                            if (backgroundText != null && backgroundText !== "") {
                                const backgroundJson = window.atob(backgroundText);
                                if (backgroundJson != null && backgroundJson !== "") {
                                    backgroundParsed = JSON.parse(backgroundJson);
                                    if (backgroundParsed != null) {
                                        if (backgroundParsed.root != null) {
                                            this.parseNodeObject(backgroundParsed.root);
                                        }
                                    }
                                }
                            }
                            PROJECT.UserInterface.BackgroundTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("BACKGROUND", false, this.scene, this.textureSampleMode, this.setAdaptiveScale);
                            if (PROJECT.UserInterface.BackgroundTexture != null) {
                                if (this.backgroundData.scaleToForeground === true) {
                                    if (PROJECT.UserInterface.AdvancedTexture.idealWidth != null) {
                                        PROJECT.UserInterface.BackgroundTexture.idealWidth = PROJECT.UserInterface.AdvancedTexture.idealWidth;
                                    }
                                    if (PROJECT.UserInterface.AdvancedTexture.idealHeight != null) {
                                        PROJECT.UserInterface.BackgroundTexture.idealHeight = PROJECT.UserInterface.AdvancedTexture.idealHeight;
                                    }
                                    if (PROJECT.UserInterface.AdvancedTexture.useSmallestIdeal != null) {
                                        PROJECT.UserInterface.BackgroundTexture.useSmallestIdeal = PROJECT.UserInterface.AdvancedTexture.useSmallestIdeal;
                                    }
                                    if (PROJECT.UserInterface.AdvancedTexture.renderAtIdealSize != null) {
                                        PROJECT.UserInterface.BackgroundTexture.renderAtIdealSize = PROJECT.UserInterface.AdvancedTexture.renderAtIdealSize;
                                    }
                                }
                                else {
                                    PROJECT.UserInterface.BackgroundTexture.useSmallestIdeal = false;
                                    PROJECT.UserInterface.BackgroundTexture.renderAtIdealSize = false;
                                }
                                if (backgroundParsed != null)
                                    PROJECT.UserInterface.BackgroundTexture.parseSerializedObject(backgroundParsed, false);
                                if (this.backgroundData.scaleToForeground === true)
                                    PROJECT.UserInterface.BackgroundTexture.scaleTo(width, height);
                            }
                        }
                    }
                }
            }
            if (PROJECT.UserInterface.OnInterfaceLoaded && PROJECT.UserInterface.OnInterfaceLoaded.hasObservers()) {
                try {
                    PROJECT.UserInterface.OnInterfaceLoaded.notifyObservers(PROJECT.UserInterface.AdvancedTexture);
                }
                catch (error) {
                    console.warn(error.message);
                }
            }
            this.engineResize();
        }
        attachWebFonts() {
            if (PROJECT.UserInterface.FontFacesAttached === false) {
                PROJECT.UserInterface.FontFacesAttached = true;
                document.fonts.ready.then(() => {
                    BABYLON.Tools.Log("Document fonts ready.");
                    if (PROJECT.UserInterface.OnFontFacesReady && PROJECT.UserInterface.OnFontFacesReady.hasObservers()) {
                        try {
                            PROJECT.UserInterface.OnFontFacesReady.notifyObservers(document.fonts);
                        }
                        catch (error) {
                            console.warn(error.message);
                        }
                    }
                });
                document.fonts.onloadingdone = (fontFaceSetEvent) => {
                    this.engineResize();
                    BABYLON.Tools.Warn("All document fonts loaded.");
                    if (PROJECT.UserInterface.OnFontFacesLoaded && PROJECT.UserInterface.OnFontFacesLoaded.hasObservers()) {
                        try {
                            PROJECT.UserInterface.OnFontFacesLoaded.notifyObservers(fontFaceSetEvent);
                        }
                        catch (error) {
                            console.warn(error.message);
                        }
                    }
                };
            }
        }
        preloadWebFonts() {
            if (PROJECT.UserInterface.FontFacesPreloaded === false) {
                PROJECT.UserInterface.FontFacesPreloaded = true;
                if (this.fontFamilyList != null && this.fontFamilyList.length > 0) {
                    this.fontFamilyList.forEach((family) => {
                        const txt = document.createElement("span");
                        txt.style.fontFamily = family;
                        document.body.appendChild(txt);
                    });
                }
            }
        }
        parseNodeObject(object) {
            if (object != null) {
                if (this.defaultImageControl === true) {
                    try {
                        if (object.name != null && object.source != null && object.source !== "" && object.source.toLowerCase().indexOf("./images/") >= 0) {
                            object.source = (this.defaultImageLocation.endsWith("/")) ? object.source.replace("./images/", this.defaultImageLocation) : object.source.replace("./images", this.defaultImageLocation);
                            if (this.exportLowerCase === true)
                                object.source = object.source.toLowerCase();
                            /* DEPRECATED: KEEP-FOR-REFERENCE
                            const oname:string = object.name;
                            const lpart:number = oname.indexOf("(");
                            const rpart:number = oname.indexOf(")");
                            // ..
                            // Format New Object Source
                            // ..
                            if (lpart >= 0 && rpart >= 0 && rpart > lpart) {
                                let url:string = oname.substring((lpart + 1), rpart);
                                if (url != null && url !== "") {
                                    url = url.trim();
                                }
                                if (url != null && url !== "") {
                                    object.source = (this.defaultImageLocation.endsWith("/")) ? (this.defaultImageLocation + url) : (this.defaultImageLocation + "/" + url);
                                    // ..
                                    // Format New Object Name
                                    // ..
                                    let fname1:string = oname.substring(0, lpart);
                                    let fname2:string = oname.substring((rpart + 1));
                                    let fname3 = (fname1 + fname2);
                                    if (fname3 != null && fname3 !== "") {
                                        fname3 = fname3.trim();
                                    }
                                    if (fname3 != null && fname3 !== "") {
                                        object.name = fname3;
                                    }
                                }
                            }*/
                        }
                    }
                    catch (error) {
                        console.warn(error.message);
                    }
                }
                if (PROJECT.UserInterface.OnParseNodeObject && PROJECT.UserInterface.OnParseNodeObject.hasObservers()) {
                    try {
                        PROJECT.UserInterface.OnParseNodeObject.notifyObservers(object);
                    }
                    catch (error) {
                        console.warn(error.message);
                    }
                }
                if (object.children != null) {
                    object.children.forEach((child) => {
                        this.parseNodeObject(child);
                    });
                }
            }
        }
    }
    UserInterface.OnFontFacesReady = new BABYLON.Observable();
    UserInterface.OnFontFacesLoaded = new BABYLON.Observable();
    UserInterface.OnParseNodeObject = new BABYLON.Observable();
    UserInterface.OnInterfaceLoaded = new BABYLON.Observable();
    UserInterface.SceneController = null;
    UserInterface.AdvancedTexture = null;
    UserInterface.BackgroundTexture = null;
    UserInterface.FontFacesAttached = false;
    UserInterface.FontFacesPreloaded = false;
    PROJECT.UserInterface = UserInterface;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class AssetExporter
    */
    class AssetExporter extends UNITY.ScriptComponent {
        // Example: private helloWorld:string = "Hello World";
        awake() {
            /* Init component function */
        }
        start() {
            /* Start component function */
        }
        fixed() {
            /* Fixed update loop function */
        }
        update() {
            /* Update render loop function */
        }
        late() {
            /* Late update render loop function */
        }
        after() {
            /* After update render loop function */
        }
        ready() {
            /* Execute when ready function */
        }
        destroy() {
            /* Destroy component function */
        }
    }
    PROJECT.AssetExporter = AssetExporter;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class AssetPreloader
    */
    class AssetPreloader extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.parentMeshes = false;
            this.importMeshes = null;
            this.assetContainers = null;
        }
        destroy() {
            this.importMeshes = null;
            this.assetContainers = null;
        }
        /** Add asset preloader tasks (https://doc.babylonjs.com/divingDeeper/importers/assetManager) */
        addPreloaderTasks(assetsManager) {
            const sceneRootUrl = UNITY.SceneManager.GetRootUrl(this.scene);
            let rooturl = sceneRootUrl;
            let filename = "";
            if (this.importMeshes != null) {
                this.importMeshes.forEach((imporUrl, importIndex) => {
                    rooturl = sceneRootUrl;
                    filename = imporUrl;
                    if (imporUrl.indexOf("://") >= 0) {
                        rooturl = imporUrl.substring(0, imporUrl.lastIndexOf('/')) + "/";
                        filename = imporUrl.substring(imporUrl.lastIndexOf('/') + 1);
                    }
                    const importTask = assetsManager.addMeshTask((this.transform.name + ".MeshTask." + importIndex.toString()), null, rooturl, filename);
                    importTask.onSuccess = (task) => {
                        if (task.loadedMeshes != null) {
                            if (this.parentMeshes === true)
                                task.loadedMeshes[0].parent = this.transform;
                            const meshTaskKey = task.sceneFilename.toString().toLowerCase();
                            UNITY.SceneManager.RegisterImportMeshes(this.scene, meshTaskKey, task.loadedMeshes);
                            //console.log("Preloaded mesh: " + meshTaskKey);
                        }
                    };
                    importTask.onError = (task, message, exception) => { console.error(message, exception); };
                });
            }
            if (this.assetContainers != null) {
                this.assetContainers.forEach((assetUrl, assetIndex) => {
                    let rooturl = sceneRootUrl;
                    let filename = assetUrl;
                    if (assetUrl.indexOf("://") >= 0) {
                        rooturl = assetUrl.substring(0, assetUrl.lastIndexOf('/')) + "/";
                        filename = assetUrl.substring(assetUrl.lastIndexOf('/') + 1);
                    }
                    const assetTask = assetsManager.addContainerTask((this.transform.name + ".ContainerTask." + assetIndex.toString()), null, rooturl, filename);
                    assetTask.onSuccess = (task) => {
                        if (task.loadedContainer != null) {
                            const assetTaskKey = task.sceneFilename.toString().toLowerCase();
                            UNITY.SceneManager.RegisterAssetContainer(this.scene, assetTaskKey, task.loadedContainer);
                            //console.log("Preloaded asset: " + assetTaskKey);
                        }
                    };
                    assetTask.onError = (task, message, exception) => { console.error(message, exception); };
                });
            }
        }
    }
    PROJECT.AssetPreloader = AssetPreloader;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class NodeMaterialInstance
    */
    class NodeMaterialInstance extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.nodeMaterialData = null;
            this.setCustomRootUrl = null;
            this.m_nodeMaterial = null;
        }
        getMaterialInstance() { return this.m_nodeMaterial; }
        awake() {
            if (this.nodeMaterialData != null) {
                const rootUrl = (this.setCustomRootUrl != null && this.setCustomRootUrl !== "") ? this.setCustomRootUrl.trim() : "";
                this.m_nodeMaterial = BABYLON.NodeMaterial.Parse(this.nodeMaterialData, this.scene, rootUrl);
                this.m_nodeMaterial.name = this.transform.name + ".NodeMaterial";
            }
        }
        destroy() {
            if (this.m_nodeMaterial != null) {
                this.m_nodeMaterial.dispose();
                this.m_nodeMaterial = null;
            }
        }
    }
    PROJECT.NodeMaterialInstance = NodeMaterialInstance;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class NodeMaterialParticle
    */
    class NodeMaterialParticle extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.nodeMaterialEditor = null;
        }
        awake() {
            /* Init component function */
        }
        start() {
            if (this.nodeMaterialEditor != null) {
                const nme = SM.FindScriptComponent(this.nodeMaterialEditor, "PROJECT.NodeMaterialInstance");
                if (nme != null) {
                    const materialInstance = nme.getMaterialInstance();
                    if (materialInstance != null) {
                        this.setupNodeMaterial(materialInstance);
                    }
                    else {
                        console.warn("Null node material instance on: " + this.nodeMaterialEditor.name);
                    }
                }
                else {
                    console.warn("Failed to locate node material editor on: " + this.nodeMaterialEditor.name);
                }
            }
        }
        setupNodeMaterial(materialInstance) {
        }
        update() {
            /* Update render loop function */
        }
        late() {
            /* Late update render loop function */
        }
        after() {
            /* After update render loop function */
        }
        fixed() {
            /* Fixed update physics step function */
        }
        ready() {
            /* Execute when scene is ready function */
        }
        destroy() {
            this.nodeMaterialEditor = null;
        }
    }
    PROJECT.NodeMaterialParticle = NodeMaterialParticle;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class NodeMaterialProcess
    */
    class NodeMaterialProcess extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.nodeMaterialEditor = null;
            this.numberOfSamples = 1;
            this.samplingMode = 0;
            this.textureType = 0;
            this.textureFormat = BABYLON.Constants.TEXTUREFORMAT_RGBA;
            this.sizeRatio = 1.0;
            this.resuable = false;
            this.m_postProcess = null;
        }
        getPostProcess() { return this.m_postProcess; }
        start() {
            if (this.nodeMaterialEditor != null) {
                const nme = SM.FindScriptComponent(this.nodeMaterialEditor, "PROJECT.NodeMaterialInstance");
                if (nme != null) {
                    const materialInstance = nme.getMaterialInstance();
                    if (materialInstance != null) {
                        this.setupNodeMaterial(materialInstance);
                    }
                    else {
                        console.warn("Null node material instance on: " + this.nodeMaterialEditor.name);
                    }
                }
                else {
                    console.warn("Failed to locate node material editor on: " + this.nodeMaterialEditor.name);
                }
            }
        }
        setupNodeMaterial(materialInstance) {
            const camera = this.getCameraRig();
            if (camera != null) {
                this.m_postProcess = materialInstance.createPostProcess(camera, this.sizeRatio, this.samplingMode, this.scene.getEngine(), this.resuable, this.textureType, this.textureFormat);
                if (this.m_postProcess != null) {
                    this.m_postProcess.name = (this.transform.name + ".Process");
                    this.m_postProcess.samples = this.numberOfSamples;
                }
                else {
                    console.warn("Failed to create post process for: " + this.transform.name);
                }
            }
            else {
                console.warn("Null camera rig for: " + this.transform.name);
            }
        }
        destroy() {
            this.nodeMaterialEditor = null;
            if (this.m_postProcess != null) {
                this.m_postProcess.dispose();
                this.m_postProcess = null;
            }
        }
    }
    PROJECT.NodeMaterialProcess = NodeMaterialProcess;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class NodeMaterialTexture
    */
    class NodeMaterialTexture extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.nodeMaterialEditor = null;
            this.textureSize = 256;
            this.m_proceduralTexture = null;
        }
        getProceduralTexture() { return this.m_proceduralTexture; }
        start() {
            if (this.nodeMaterialEditor != null) {
                const nme = SM.FindScriptComponent(this.nodeMaterialEditor, "PROJECT.NodeMaterialInstance");
                if (nme != null) {
                    const materialInstance = nme.getMaterialInstance();
                    if (materialInstance != null) {
                        this.setupNodeMaterial(materialInstance);
                    }
                    else {
                        console.warn("Null node material instance on: " + this.nodeMaterialEditor.name);
                    }
                }
                else {
                    console.warn("Failed to locate node material editor on: " + this.nodeMaterialEditor.name);
                }
            }
        }
        setupNodeMaterial(materialInstance) {
            this.m_proceduralTexture = materialInstance.createProceduralTexture(this.textureSize, this.scene);
            if (this.m_proceduralTexture != null) {
                this.m_proceduralTexture.name = (this.transform.name + ".Texture");
            }
        }
        destroy() {
            this.nodeMaterialEditor = null;
            if (this.m_proceduralTexture != null) {
                this.m_proceduralTexture.dispose();
                this.m_proceduralTexture = null;
            }
        }
    }
    PROJECT.NodeMaterialTexture = NodeMaterialTexture;
})(PROJECT || (PROJECT = {}));
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class MobileInputController
    */
    class MobileInputController extends UNITY.ScriptComponent {
        static get Instance() { return PROJECT.MobileInputController.StaticInstance; }
        getLeftStick() { return this.m_leftStick; }
        getRightStick() { return this.m_rightStick; }
        getLeftStickEnabled() { return this.enableLeftJoystick; }
        getRightStickEnabled() { return this.enableRightJoystick; }
        getLeftStickElement() { return this.leftBaseElement; }
        getRightStickElement() { return this.rightBaseElement; }
        showLeftStickElement(show) { if (this.leftBaseElement != null)
            this.leftBaseElement.style.display = (show === true) ? "block" : "none"; }
        showRightStickElement(show) { if (this.rightBaseElement != null)
            this.rightBaseElement.style.display = (show === true) ? "block" : "none"; }
        constructor(transform, scene, properties) {
            super(transform, scene, properties);
            this.controlType = 0;
            this.sideMargins = 16;
            this.bottomMargins = 16;
            this.readyTimeout = 200;
            this.leftBaseElement = null;
            this.rightBaseElement = null;
            this.leftStickStyle = 0;
            this.rightStickStyle = 0;
            this.invertLeftStickY = true;
            this.invertRightStickY = true;
            this.centerLeftJoystick = false;
            this.enableLeftJoystick = true;
            this.enableRightJoystick = true;
            this.disableMouseRotation = true;
            this.updateCameraInput = false;
            this.m_leftStick = null;
            this.m_rightStick = null;
            PROJECT.MobileInputController.StaticInstance = this;
        }
        start() {
            if (this.updateCameraInput === true) {
                const camera = PROJECT.DefaultCameraSystem.GetMainCamera(this.scene);
                if (camera != null) {
                    const input = new PROJECT.FreeCameraTouchJoystickInput();
                    input.controller = this;
                    input.invertYAxis = !this.invertRightStickY;
                    camera.inputs.add(input);
                }
            }
        }
        ready() {
            if (this.controlType === 1 || UNITY.WindowManager.IsMobile()) {
                if (this.disableMouseRotation === true)
                    UNITY.SceneManager.VirtualJoystickEnabled = true; // Note: If Using Joystick Rotation Then Disable Mouse Input
                const displayTimeout = (this.readyTimeout >= 10) ? this.readyTimeout : 10;
                UNITY.SceneManager.SetTimeout(displayTimeout, () => {
                    this.createHtmlElements();
                    if (this.enableLeftJoystick === true)
                        this.m_leftStick = new UNITY.TouchJoystickHandler("stick1", 64, 8);
                    if (this.enableRightJoystick === true)
                        this.m_rightStick = new UNITY.TouchJoystickHandler("stick2", 64, 8);
                });
            }
        }
        update() {
            if (this.enableLeftJoystick === true && this.m_leftStick != null) {
                const leftStickValueX = this.m_leftStick.getValueX();
                const leftStickValueY = this.m_leftStick.getValueY();
                UNITY.InputController.SetLeftJoystickBuffer(leftStickValueX, leftStickValueY, this.invertLeftStickY);
            }
            if (this.enableRightJoystick === true && this.m_rightStick != null) {
                const rightStickValueX = this.m_rightStick.getValueX();
                const rightStickValueY = this.m_rightStick.getValueY();
                UNITY.InputController.SetRightJoystickBuffer(rightStickValueX, rightStickValueY, this.invertRightStickY);
            }
        }
        destroy() {
            if (this.m_leftStick != null) {
                this.m_leftStick.dispose();
                this.m_leftStick = null;
            }
            if (this.m_rightStick != null) {
                this.m_rightStick.dispose();
                this.m_rightStick = null;
            }
        }
        createHtmlElements() {
            const rootUrl = UNITY.SceneManager.GetRootUrl(this.scene);
            const baseImageData = this.getProperty("joystickBaseImage");
            const leftStickImageData = this.getProperty("leftStickImage");
            const rightStickImageData = this.getProperty("rightStickImage");
            const baseImageFilename = (baseImageData != null) ? baseImageData.filename : "baseImage.png";
            const leftStickImageFilename = (leftStickImageData != null) ? leftStickImageData.filename : "leftStick.png";
            const rightStickImageFilename = (rightStickImageData != null) ? rightStickImageData.filename : "rightStick.png";
            // ..
            // style="border: 1px solid red; width: 128px; position: absolute; left:20px; bottom:20px;"
            // ..
            if (this.enableLeftJoystick === true) {
                this.leftBaseElement = document.createElement("div");
                this.leftBaseElement.id = "base1";
                this.leftBaseElement.style.width = "128px";
                this.leftBaseElement.style.display = (this.leftStickStyle === 0) ? "block" : "none";
                if (this.centerLeftJoystick === true) {
                    this.leftBaseElement.style.position = "fixed";
                    this.leftBaseElement.style.left = "50%";
                    this.leftBaseElement.style.bottom = (this.bottomMargins.toFixed(0) + "px");
                    this.leftBaseElement.style.transform = "translate(-50%, 0%)";
                    this.leftBaseElement.style.margin = "0 auto";
                }
                else {
                    this.leftBaseElement.style.position = "absolute";
                    this.leftBaseElement.style.left = (this.sideMargins.toFixed(0) + "px");
                    this.leftBaseElement.style.bottom = (this.bottomMargins.toFixed(0) + "px");
                }
                const baseImg1 = document.createElement("img");
                baseImg1.id = "image1";
                baseImg1.src = (rootUrl + baseImageFilename);
                const ballDiv1 = document.createElement("div");
                ballDiv1.id = "stick1";
                ballDiv1.style.position = "absolute";
                ballDiv1.style.top = "32px";
                ballDiv1.style.left = "32px";
                const ballImg1 = document.createElement("img");
                ballImg1.id = "ball1";
                ballImg1.src = (rootUrl + leftStickImageFilename);
                this.leftBaseElement.appendChild(baseImg1);
                ballDiv1.appendChild(ballImg1);
                this.leftBaseElement.appendChild(ballDiv1);
                document.body.appendChild(this.leftBaseElement);
            }
            // ..
            // style="border: 1px solid blue; width: 128px; position: absolute; right:20px; bottom:20px;"
            // ..
            if (this.enableRightJoystick === true) {
                this.rightBaseElement = document.createElement("div");
                this.rightBaseElement.id = "base2";
                this.rightBaseElement.style.width = "128px";
                this.rightBaseElement.style.position = "absolute";
                this.rightBaseElement.style.right = (this.sideMargins.toFixed(0) + "px");
                this.rightBaseElement.style.bottom = (this.bottomMargins.toFixed(0) + "px");
                this.rightBaseElement.style.display = (this.rightStickStyle === 0) ? "block" : "none";
                const baseImg2 = document.createElement("img");
                baseImg2.id = "image2";
                baseImg2.src = (rootUrl + baseImageFilename);
                const ballDiv2 = document.createElement("div");
                ballDiv2.id = "stick2";
                ballDiv2.style.position = "absolute";
                ballDiv2.style.top = "32px";
                ballDiv2.style.left = "32px";
                const ballImg2 = document.createElement("img");
                ballImg2.id = "ball2";
                ballImg2.src = (rootUrl + rightStickImageFilename);
                this.rightBaseElement.appendChild(baseImg2);
                ballDiv2.appendChild(ballImg2);
                this.rightBaseElement.appendChild(ballDiv2);
                document.body.appendChild(this.rightBaseElement);
            }
        }
    }
    MobileInputController.StaticInstance = null;
    PROJECT.MobileInputController = MobileInputController;
    /**
     * Manage the joystick inputs to control a free camera.
     * @see https://doc.babylonjs.com/how_to/customizing_camera_inputs
     */
    class FreeCameraTouchJoystickInput {
        constructor() {
            /**
             * Defines the joystick rotation sensiblity.
             * This is the threshold from when rotation starts to be accounted for to prevent jittering.
             */
            this.joystickAngularSensibility = 200;
            /**
             * Defines the joystick move sensiblity.
             * This is the threshold from when moving starts to be accounted for for to prevent jittering.
             */
            this.joystickMoveSensibility = 40.0;
            /**
             * Defines the minimum value at which any analog stick input is ignored.
             * Note: This value should only be a value between 0 and 1.
             */
            this.deadzoneDelta = 0.1;
            this._yAxisScale = 1.0;
            // private members
            this.LSValues = new BABYLON.Vector2(0, 0);
            this.RSValues = new BABYLON.Vector2(0, 0);
            this._cameraTransform = BABYLON.Matrix.Identity();
            this._deltaTransform = BABYLON.Vector3.Zero();
            this._vector3 = BABYLON.Vector3.Zero();
            this._vector2 = BABYLON.Vector2.Zero();
            this._attached = false;
        }
        /**
         * Gets or sets a boolean indicating that Yaxis (for right stick) should be inverted
         */
        get invertYAxis() { return this._yAxisScale !== 1.0; }
        set invertYAxis(value) { this._yAxisScale = value ? -1.0 : 1.0; }
        /**
         * Attach the input controls to a specific dom element to get the input from.
         */
        attachControl() {
            this._attached = true;
        }
        /**
         * Detach the current controls from the specified dom element.
         * @param ignored defines an ignored parameter kept for backward compatibility. If you want to define the source input element, you can set engine.inputElement before calling camera.attachControl
         */
        detachControl(ignored) {
            this._attached = false;
        }
        /**
         * Update the current camera state depending on the inputs that have been used this frame.
         * This is a dynamically created lambda to avoid the performance penalty of looping for inputs in the render loop.
         */
        checkInputs() {
            if (this.camera != null && this.controller != null && this._attached === true) {
                const LStick = this.controller.getLeftStick();
                if (LStick != null) {
                    this.LSValues.set(LStick.getValueX(), LStick.getValueY());
                    if (this.joystickMoveSensibility !== 0) {
                        this.LSValues.x = (Math.abs(this.LSValues.x) > this.deadzoneDelta) ? this.LSValues.x / this.joystickMoveSensibility : 0;
                        this.LSValues.y = (Math.abs(this.LSValues.y) > this.deadzoneDelta) ? this.LSValues.y / this.joystickMoveSensibility : 0;
                    }
                }
                else {
                    this.LSValues.set(0, 0);
                }
                // ..
                const RStick = this.controller.getRightStick();
                if (RStick != null) {
                    this.RSValues.set(RStick.getValueX(), RStick.getValueY());
                    if (this.joystickAngularSensibility !== 0) {
                        this.RSValues.x = (Math.abs(this.RSValues.x) > this.deadzoneDelta) ? this.RSValues.x / this.joystickAngularSensibility : 0;
                        this.RSValues.y = ((Math.abs(this.RSValues.y) > this.deadzoneDelta) ? this.RSValues.y / this.joystickAngularSensibility : 0) * this._yAxisScale;
                    }
                }
                else {
                    this.RSValues.set(0, 0);
                }
                // ..
                if (!this.camera.rotationQuaternion) {
                    BABYLON.Matrix.RotationYawPitchRollToRef(this.camera.rotation.y, this.camera.rotation.x, 0, this._cameraTransform);
                }
                else {
                    this.camera.rotationQuaternion.toRotationMatrix(this._cameraTransform);
                }
                // ..
                var speed = this.camera._computeLocalCameraSpeed() * 50.0;
                this._vector3.copyFromFloats(this.LSValues.x * speed, 0, -this.LSValues.y * speed);
                // ..
                BABYLON.Vector3.TransformCoordinatesToRef(this._vector3, this._cameraTransform, this._deltaTransform);
                this.camera.cameraDirection.addInPlace(this._deltaTransform);
                this._vector2.copyFromFloats(this.RSValues.y, this.RSValues.x);
                this.camera.cameraRotation.addInPlace(this._vector2);
            }
        }
        /**
         * Gets the class name of the current input.
         * @returns the class name
         */
        getClassName() {
            return "FreeCameraTouchJoystickInput";
        }
        /**
         * Get the friendly name associated with the input class.
         * @returns the input friendly name
         */
        getSimpleName() {
            return "joystick";
        }
    }
    __decorate([
        BABYLON.serialize()
    ], FreeCameraTouchJoystickInput.prototype, "joystickAngularSensibility", void 0);
    __decorate([
        BABYLON.serialize()
    ], FreeCameraTouchJoystickInput.prototype, "joystickMoveSensibility", void 0);
    PROJECT.FreeCameraTouchJoystickInput = FreeCameraTouchJoystickInput;
    BABYLON.CameraInputTypes["FreeCameraTouchJoystickInput"] = PROJECT.FreeCameraTouchJoystickInput;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class MobileOccludeMaterial
    */
    class MobileOccludeMaterial extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.applyToMaterial = true;
        }
        awake() {
            if (this.applyToMaterial === true && this.transform instanceof BABYLON.AbstractMesh) {
                this.transform.material.disableColorWrite = true;
            }
        }
    }
    PROJECT.MobileOccludeMaterial = MobileOccludeMaterial;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class MobileShadowMaterial
    */
    class MobileShadowMaterial extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.createNewMaterial = true;
        }
        awake() {
            if (this.createNewMaterial === true && this.transform instanceof BABYLON.AbstractMesh) {
                const materialName = this.transform.name.replace(" ", "") + ".ShadowMaterial";
                this.transform.material = new BABYLON.ShadowOnlyMaterial(materialName, this.scene);
            }
        }
        destroy() {
            if (this.createNewMaterial === true && this.transform instanceof BABYLON.AbstractMesh) {
                if (this.transform.material != null && this.transform.material instanceof BABYLON.ShadowOnlyMaterial) {
                    this.transform.material.dispose();
                }
            }
        }
    }
    PROJECT.MobileShadowMaterial = MobileShadowMaterial;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class BallSocketJoint
    */
    class BallSocketJoint extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.bodyA = null;
            this.bodyB = null;
            this.pivotA = new BABYLON.Vector3(-0.5, 0, -0.5);
            this.pivotB = new BABYLON.Vector3(-0.5, 0, 0.5);
            this.axisA = new BABYLON.Vector3(0, 1, 0);
            this.axisB = new BABYLON.Vector3(0, 1, 0);
            this.constraint = null;
            this.collisionsEnabled = false;
        }
        awake() {
            const bodyAInfo = this.getProperty("bodyA");
            const bodyBInfo = this.getProperty("bodyB");
            if (bodyAInfo != null && bodyBInfo != null) {
                this.bodyA = (this.transform.name === bodyAInfo.name) ? this.transform : this.getChildNode(bodyAInfo.name);
                this.bodyB = this.getChildNode(bodyBInfo.name);
                if (this.bodyA != null && this.bodyB != null) {
                    if (this.bodyA.physicsBody != null && this.bodyB.physicsBody != null) {
                        this.constraint = new BABYLON.BallAndSocketConstraint(this.pivotA, this.pivotB, this.axisA, this.axisB, this.scene);
                        this.bodyA.physicsBody.addConstraint(this.bodyB.physicsBody, this.constraint);
                        this.constraint.isCollisionsEnabled = this.collisionsEnabled;
                    }
                }
            }
        }
        destroy() {
            this.bodyA = null;
            this.bodyB = null;
            if (this.constraint != null) {
                this.constraint.dispose();
                this.constraint = null;
            }
        }
    }
    PROJECT.BallSocketJoint = BallSocketJoint;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class DistanceJoint
    */
    class DistanceJoint extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.bodyA = null;
            this.bodyB = null;
            this.maxDistance = 0;
            this.constraint = null;
            this.collisionsEnabled = false;
        }
        awake() {
            const bodyAInfo = this.getProperty("bodyA");
            const bodyBInfo = this.getProperty("bodyB");
            if (bodyAInfo != null && bodyBInfo != null) {
                this.bodyA = (this.transform.name === bodyAInfo.name) ? this.transform : this.getChildNode(bodyAInfo.name);
                this.bodyB = this.getChildNode(bodyBInfo.name);
                if (this.bodyA != null && this.bodyB != null) {
                    if (this.bodyA.physicsBody != null && this.bodyB.physicsBody != null) {
                        this.constraint = new BABYLON.DistanceConstraint(this.maxDistance, this.scene);
                        this.bodyA.physicsBody.addConstraint(this.bodyB.physicsBody, this.constraint);
                        this.constraint.isCollisionsEnabled = this.collisionsEnabled;
                    }
                }
            }
        }
        destroy() {
            this.bodyA = null;
            this.bodyB = null;
            if (this.constraint != null) {
                this.constraint.dispose();
                this.constraint = null;
            }
        }
    }
    PROJECT.DistanceJoint = DistanceJoint;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class FixedHingeJoint
    */
    class FixedHingeJoint extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.bodyA = null;
            this.bodyB = null;
            this.pivotA = new BABYLON.Vector3(0, 0, -0.5);
            this.pivotB = new BABYLON.Vector3(0, 0, 0.5);
            this.constraint = null;
            this.collisionsEnabled = false;
        }
        awake() {
            const bodyAInfo = this.getProperty("bodyA");
            const bodyBInfo = this.getProperty("bodyB");
            if (bodyAInfo != null && bodyBInfo != null) {
                this.bodyA = (this.transform.name === bodyAInfo.name) ? this.transform : this.getChildNode(bodyAInfo.name);
                this.bodyB = this.getChildNode(bodyBInfo.name);
                if (this.bodyA != null && this.bodyB != null) {
                    if (this.bodyA.physicsBody != null && this.bodyB.physicsBody != null) {
                        this.constraint = new BABYLON.HingeConstraint(this.pivotA, this.pivotB, undefined, undefined, this.scene);
                        this.bodyA.physicsBody.addConstraint(this.bodyB.physicsBody, this.constraint);
                        this.constraint.isCollisionsEnabled = this.collisionsEnabled;
                    }
                }
            }
        }
        destroy() {
            this.bodyA = null;
            this.bodyB = null;
            if (this.constraint != null) {
                this.constraint.dispose();
                this.constraint = null;
            }
        }
    }
    PROJECT.FixedHingeJoint = FixedHingeJoint;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class LockedJoint
    */
    class LockedJoint extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.bodyA = null;
            this.bodyB = null;
            this.pivotA = new BABYLON.Vector3(0.5, 0.5, -0.5);
            this.pivotB = new BABYLON.Vector3(-0.5, -0.5, 0.5);
            this.axisA = new BABYLON.Vector3(0, 1, 0);
            this.axisB = new BABYLON.Vector3(0, 1, 0);
            this.constraint = null;
            this.collisionsEnabled = false;
        }
        awake() {
            const bodyAInfo = this.getProperty("bodyA");
            const bodyBInfo = this.getProperty("bodyB");
            if (bodyAInfo != null && bodyBInfo != null) {
                this.bodyA = (this.transform.name === bodyAInfo.name) ? this.transform : this.getChildNode(bodyAInfo.name);
                this.bodyB = this.getChildNode(bodyBInfo.name);
                if (this.bodyA != null && this.bodyB != null) {
                    if (this.bodyA.physicsBody != null && this.bodyB.physicsBody != null) {
                        this.constraint = new BABYLON.LockConstraint(this.pivotA, this.pivotB, this.axisA, this.axisB, this.scene);
                        this.bodyA.physicsBody.addConstraint(this.bodyB.physicsBody, this.constraint);
                        this.constraint.isCollisionsEnabled = this.collisionsEnabled;
                    }
                }
            }
        }
        destroy() {
            this.bodyA = null;
            this.bodyB = null;
            if (this.constraint != null) {
                this.constraint.dispose();
                this.constraint = null;
            }
        }
    }
    PROJECT.LockedJoint = LockedJoint;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class PrismaticJoint
    */
    class PrismaticJoint extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.bodyA = null;
            this.bodyB = null;
            this.pivotA = new BABYLON.Vector3(0, 0, -0.2);
            this.pivotB = new BABYLON.Vector3(0, 0, 0.25);
            this.axisA = new BABYLON.Vector3(0, 1, 0);
            this.axisB = new BABYLON.Vector3(0, 1, 0);
            this.constraint = null;
            this.collisionsEnabled = false;
        }
        awake() {
            const bodyAInfo = this.getProperty("bodyA");
            const bodyBInfo = this.getProperty("bodyB");
            if (bodyAInfo != null && bodyBInfo != null) {
                this.bodyA = (this.transform.name === bodyAInfo.name) ? this.transform : this.getChildNode(bodyAInfo.name);
                this.bodyB = this.getChildNode(bodyBInfo.name);
                if (this.bodyA != null && this.bodyB != null) {
                    if (this.bodyA.physicsBody != null && this.bodyB.physicsBody != null) {
                        this.constraint = new BABYLON.PrismaticConstraint(this.pivotA, this.pivotB, this.axisA, this.axisB, this.scene);
                        this.bodyA.physicsBody.addConstraint(this.bodyB.physicsBody, this.constraint);
                        this.constraint.isCollisionsEnabled = this.collisionsEnabled;
                    }
                }
            }
        }
        destroy() {
            this.bodyA = null;
            this.bodyB = null;
            if (this.constraint != null) {
                this.constraint.dispose();
                this.constraint = null;
            }
        }
    }
    PROJECT.PrismaticJoint = PrismaticJoint;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class SixdofJoint
    */
    class SixdofJoint extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.bodyA = null;
            this.bodyB = null;
            this.pivotA = new BABYLON.Vector3(0, -0.5, 0);
            this.pivotB = new BABYLON.Vector3(0, 0.5, 0);
            this.perpAxisA = new BABYLON.Vector3(1, 0, 0);
            this.perpAxisB = new BABYLON.Vector3(1, 0, 0);
            this.axisLimits = null;
            this.constraint = null;
            this.collisionsEnabled = false;
        }
        awake() {
            const bodyAInfo = this.getProperty("bodyA");
            const bodyBInfo = this.getProperty("bodyB");
            if (bodyAInfo != null && bodyBInfo != null) {
                this.bodyA = (this.transform.name === bodyAInfo.name) ? this.transform : this.getChildNode(bodyAInfo.name);
                this.bodyB = this.getChildNode(bodyBInfo.name);
                if (this.bodyA != null && this.bodyB != null) {
                    if (this.bodyA.physicsBody != null && this.bodyB.physicsBody != null) {
                        this.constraint = new BABYLON.Physics6DoFConstraint({
                            pivotA: this.pivotA,
                            pivotB: this.pivotB,
                            perpAxisA: this.perpAxisA,
                            perpAxisB: this.perpAxisB
                        }, this.axisLimits, this.scene);
                        this.bodyA.physicsBody.addConstraint(this.bodyB.physicsBody, this.constraint);
                        this.constraint.isCollisionsEnabled = this.collisionsEnabled;
                    }
                }
            }
        }
        destroy() {
            this.bodyA = null;
            this.bodyB = null;
            if (this.constraint != null) {
                this.constraint.dispose();
                this.constraint = null;
            }
        }
    }
    PROJECT.SixdofJoint = SixdofJoint;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class SliderJoint
    */
    class SliderJoint extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.bodyA = null;
            this.bodyB = null;
            this.pivotA = new BABYLON.Vector3(0, 0, -0.2);
            this.pivotB = new BABYLON.Vector3(0, 0, 0.25);
            this.axisA = new BABYLON.Vector3(0, 1, 0);
            this.axisB = new BABYLON.Vector3(0, 1, 0);
            this.constraint = null;
            this.collisionsEnabled = false;
        }
        awake() {
            const bodyAInfo = this.getProperty("bodyA");
            const bodyBInfo = this.getProperty("bodyB");
            if (bodyAInfo != null && bodyBInfo != null) {
                this.bodyA = (this.transform.name === bodyAInfo.name) ? this.transform : this.getChildNode(bodyAInfo.name);
                this.bodyB = this.getChildNode(bodyBInfo.name);
                if (this.bodyA != null && this.bodyB != null) {
                    if (this.bodyA.physicsBody != null && this.bodyB.physicsBody != null) {
                        this.constraint = new BABYLON.SliderConstraint(this.pivotA, this.pivotB, this.axisA, this.axisB, this.scene);
                        this.bodyA.physicsBody.addConstraint(this.bodyB.physicsBody, this.constraint);
                        this.constraint.isCollisionsEnabled = this.collisionsEnabled;
                    }
                }
            }
        }
        destroy() {
            this.bodyA = null;
            this.bodyB = null;
            if (this.constraint != null) {
                this.constraint.dispose();
                this.constraint = null;
            }
        }
    }
    PROJECT.SliderJoint = SliderJoint;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class RemotePlayerController
    */
    class RemotePlayerController extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.updateStateParams = true;
            this.smoothMotionTime = 0;
            this.smoothInputVectors = false;
            this.animationState = null;
            this.animationStateParams = null;
        }
        awake() {
            this.updateStateParams = this.getProperty("updateStateParams", this.updateStateParams);
            this.smoothMotionTime = this.getProperty("smoothMotionTime", this.smoothMotionTime);
            this.smoothInputVectors = this.getProperty("smoothInputVectors", this.smoothInputVectors);
            this.animationStateParams = this.getProperty("animationStateParams", this.animationStateParams);
            //console.warn("Remote Player Controller: " + this.transform.name);
            //console.log(this);
        }
        update() {
            const deltaTime = this.getDeltaSeconds();
            // TODO - FIX THIS SHIT
            if (this.animationState == null) {
                this.attachAnimationController();
            }
            // ..
            // Query Network Attributes
            // ..
            if (UNITY.EntityController.HasNetworkEntity(this.transform)) {
                const direction = UNITY.EntityController.QueryBufferedAttribute(this.transform, 0); // Direction
                const magnitude = UNITY.EntityController.QueryBufferedAttribute(this.transform, 1); // Magnitude
                const inputX = UNITY.EntityController.QueryBufferedAttribute(this.transform, 2); // Horizonal
                const inputZ = UNITY.EntityController.QueryBufferedAttribute(this.transform, 3); // Vertical
                const mouseX = UNITY.EntityController.QueryBufferedAttribute(this.transform, 4); // MouseX
                const mouseY = UNITY.EntityController.QueryBufferedAttribute(this.transform, 5); // Mousey
                const vvelocity = UNITY.EntityController.QueryBufferedAttribute(this.transform, 6); // Vertical Velocity
                const movespeed = UNITY.EntityController.QueryBufferedAttribute(this.transform, 7); // Movement Speed
                const actionstate = UNITY.EntityController.QueryBufferedAttribute(this.transform, 8); // Action State
                const jumpframe = UNITY.EntityController.QueryBufferedAttribute(this.transform, 9); // Jump Frame
                const isjumping = UNITY.EntityController.QueryBufferedAttribute(this.transform, 10); // Is Jumping
                const isfalling = UNITY.EntityController.QueryBufferedAttribute(this.transform, 11); // Is Falling
                const issliding = UNITY.EntityController.QueryBufferedAttribute(this.transform, 12); // Is Sliding
                const isgrounded = UNITY.EntityController.QueryBufferedAttribute(this.transform, 13); // Is Grounded
                // ..
                // Update Animation State Params
                // ..
                if (this.animationState != null && this.updateStateParams === true) {
                    this.validateAnimationStateParams();
                    this.animationState.setInteger(this.animationStateParams.moveDirection, direction);
                    this.animationState.setFloat(this.animationStateParams.heightInput, vvelocity);
                    this.animationState.setBool(this.animationStateParams.jumpFrame, (jumpframe !== 0));
                    this.animationState.setBool(this.animationStateParams.jumpState, (isjumping !== 0));
                    this.animationState.setInteger(this.animationStateParams.actionState, actionstate);
                    this.animationState.setBool(this.animationStateParams.fallingState, (isfalling !== 0));
                    this.animationState.setBool(this.animationStateParams.slidingState, (issliding !== 0));
                    this.animationState.setBool(this.animationStateParams.groundedState, (isgrounded !== 0));
                    if (this.smoothMotionTime > 0) {
                        if (this.smoothInputVectors === true) {
                            this.animationState.setSmoothFloat(this.animationStateParams.horizontalInput, inputX, this.smoothMotionTime, deltaTime);
                            this.animationState.setSmoothFloat(this.animationStateParams.verticalInput, inputZ, this.smoothMotionTime, deltaTime);
                            this.animationState.setSmoothFloat(this.animationStateParams.mouseXInput, mouseX, this.smoothMotionTime, deltaTime);
                            this.animationState.setSmoothFloat(this.animationStateParams.mouseYInput, mouseY, this.smoothMotionTime, deltaTime);
                        }
                        else {
                            this.animationState.setFloat(this.animationStateParams.horizontalInput, inputX);
                            this.animationState.setFloat(this.animationStateParams.verticalInput, inputZ);
                            this.animationState.setFloat(this.animationStateParams.mouseXInput, mouseX);
                            this.animationState.setFloat(this.animationStateParams.mouseYInput, mouseY);
                        }
                        this.animationState.setSmoothFloat(this.animationStateParams.inputMagnitude, magnitude, this.smoothMotionTime, deltaTime);
                        this.animationState.setSmoothFloat(this.animationStateParams.speedInput, movespeed, this.smoothMotionTime, deltaTime);
                    }
                    else {
                        this.animationState.setFloat(this.animationStateParams.horizontalInput, inputX);
                        this.animationState.setFloat(this.animationStateParams.verticalInput, inputZ);
                        this.animationState.setFloat(this.animationStateParams.mouseXInput, mouseX);
                        this.animationState.setFloat(this.animationStateParams.mouseYInput, mouseY);
                        this.animationState.setFloat(this.animationStateParams.inputMagnitude, magnitude);
                        this.animationState.setFloat(this.animationStateParams.speedInput, movespeed);
                    }
                    //if (this.isCharacterNavigating === true) {
                    //    // TODO - Update Speed Input With Navigation Magnitude
                    //    // this.animationState.setFloat(this.animationStateParams.speedInput, magnitude);
                    //}
                }
            }
        }
        destroy() {
            this.animationState = null;
            this.animationStateParams = null;
        }
        attachAnimationController() {
            if (this.animationState == null) {
                this.animationState = this.getComponent("UNITY.AnimationState");
                if (this.animationState == null) {
                    const animationNode = this.getChildWithScript("UNITY.AnimationState");
                    if (animationNode != null) {
                        this.animationState = UNITY.SceneManager.FindScriptComponent(animationNode, "UNITY.AnimationState");
                    }
                    else {
                        // DEBUG: UNITY.SceneManager.LogWarning("Failed to locate animator node for: " + this.transform);
                    }
                }
            }
            if (this.animationState != null) {
                this.animationState.onAnimationUpdateObservable.add(() => {
                    if (this.animationState.ikFrameEnabled() === true) {
                        // FIXME: Update target mesh position When Grounded - Use Raycast - ???
                        //if (this._ikLeftController != null) {
                        //    this._ikLeftController.update();
                        //}
                        //if (this._ikRightController != null) {
                        //    this._ikRightController.update();
                        //}
                    }
                });
            }
        }
        validateAnimationStateParams() {
            if (this.animationStateParams == null) {
                this.animationStateParams = {
                    moveDirection: "Direction",
                    inputMagnitude: "Magnitude",
                    horizontalInput: "Horizontal",
                    verticalInput: "Vertical",
                    mouseXInput: "MouseX",
                    mouseYInput: "MouseY",
                    heightInput: "Height",
                    speedInput: "Speed",
                    jumpFrame: "Jumped",
                    jumpState: "Jump",
                    actionState: "Action",
                    fallingState: "FreeFall",
                    slidingState: "Sliding",
                    groundedState: "Grounded"
                };
            }
        }
    }
    PROJECT.RemotePlayerController = RemotePlayerController;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
     * Babylon toolkit standard player controller class
     * @class StandardPlayerController - All rights reserved (c) 2020 Mackey Kinard
    */
    class StandardPlayerController extends UNITY.ScriptComponent {
        isAnimationEnabled() { return this.updateStateParams; }
        isRunButtonPressed() { return this.isRunPressed; }
        isJumpButtonPressed() { return this.isJumpPressed; }
        getPlayerJumped() { return this.isCharacterJumpFrame; }
        getPlayerJumping() { return this.isCharacterJumping; }
        getPlayerFalling() { return this.isCharacterFalling; }
        getPlayerSliding() { return this.isCharacterSliding; }
        getPlayerGrounded() { return this.isCharacterGrounded; }
        getFallTriggered() { return this.isCharacterFallTriggered; }
        getMovementSpeed() { return this.movementSpeed; }
        getCameraBoomNode() { return this.cameraNode; }
        getCameraTransform() { return this.cameraPivot; }
        getAnimationState() { return this.animationState; }
        getVerticalVelocity() { return this.getCheckedVerticalVelocity(); }
        getCharacterController() { return this.characterController; }
        getPlayerLookRotation() { return this.playerLookRotation; }
        getPlayerMoveDirection() { return this.playerMoveDirection; }
        getInputMovementVector() { return this.inputMovementVector; }
        getInputMagnitudeValue() { return this.inputMagnitude; }
        getCameraPivotPosition() { return (this.cameraPivot != null) ? this.cameraPivot.position : null; }
        getCameraPivotRotation() { return (this.cameraPivot != null) ? this.cameraPivot.rotationQuaternion : null; }
        getClimbContact() { return this.climbContact; }
        getClimbContactNode() { return this.climbContactNode; }
        getClimbContactPoint() { return this.climbContactPoint; }
        getClimbContactAngle() { return this.climbContactAngle; }
        getClimbContactNormal() { return this.climbContactNormal; }
        getClimbContactDistance() { return this.climbContactDistance; }
        ;
        getHeightContact() { return this.heightContact; }
        getHeightContactNode() { return this.heightContactNode; }
        getHeightContactPoint() { return this.heightContactPoint; }
        getHeightContactAngle() { return this.heightContactAngle; }
        getHeightContactNormal() { return this.heightContactNormal; }
        getHeightContactDistance() { return this.heightContactDistance; }
        ;
        setGavityForce(gravity) {
            this.gravitationalForce = gravity;
            if (this.characterController != null) {
                this.characterController.setGravity(this.gravitationalForce);
            }
        }
        setFallingSpeed(velocity) {
            this.terminalVelocity = velocity;
            if (this.characterController != null) {
                this.characterController.setFallingSpeed(this.terminalVelocity);
            }
        }
        constructor(transform, scene, properties) {
            super(transform, scene, properties);
            this.enableInput = false;
            this.attachCamera = false;
            this.rotateCamera = true;
            this.mouseWheel = true;
            this.toggleView = true;
            this.freeLooking = false;
            this.requireSprintButton = false;
            this.gravitationalForce = 29.4;
            this.terminalVelocity = 55.0;
            this.minFallVelocity = 1.0;
            this.airbornTimeout = 0.5;
            this.detectionRadius = 0.22;
            this.verticalOffset = 0.08;
            this.forwardOffset = 0.0;
            //public normalAngle:number = 0.6;
            //public radiusScale:number = 0.5;
            //public rayLength:number = 10;
            //public rayOrigin:number = 1;
            this.maxAngle = 45;
            this.speedFactor = 1.0;
            this.rootMotion = false;
            this.moveSpeed = 6.0;
            this.walkSpeed = 2.0;
            this.lookSpeed = 2.0;
            this.jumpSpeed = 10.0;
            this.jumpDelay = 0.25;
            this.eyesHeight = 1.0;
            this.pivotHeight = 1.0;
            this.maxDistance = 5.0;
            this.scrollSpeed = 25;
            this.topLookLimit = 60.0;
            this.downLookLimit = 30.0;
            this.lowTurnSpeed = 15.0;
            this.highTurnSpeed = 25.0;
            // DEPRECIATED: public smoothingSpeed:number = 0.12;
            this.smoothMotionTime = 0;
            this.smoothInputVectors = false;
            this.smoothAcceleration = false;
            this.accelerationSpeed = 0.1;
            this.decelerationSpeed = 0.1;
            this.avatarSkinTag = "Skin";
            this.climbVolumeTag = "Climb";
            this.vaultVolumeTag = "Vault";
            this.maxHeightRanges = null;
            this.useClimbSystem = false;
            this.distanceFactor = 0.85;
            this.cameraSmoothing = 5;
            this.cameraCollisions = true;
            this.inputMagnitude = 0;
            this.landingEpsilon = 0.1;
            this.minimumDistance = 0.85;
            this.movementAllowed = true;
            this.playerInputX = 0;
            this.playerInputZ = 0;
            this.playerMouseX = 0;
            this.playerMouseY = 0;
            this.runKeyRequired = true;
            this.ignoreTriggerTags = null;
            this.buttonRun = BABYLON.Xbox360Button.LeftStick;
            this.keyboardRun = UNITY.UserInputKey.Shift;
            this.buttonJump = BABYLON.Xbox360Button.A;
            this.keyboardJump = UNITY.UserInputKey.SpaceBar;
            this.buttonCamera = BABYLON.Xbox360Button.Y;
            this.keyboardCamera = UNITY.UserInputKey.P;
            this.postNetworkAttributes = false;
            this.playerNumber = UNITY.PlayerNumber.One;
            this.boomPosition = new BABYLON.Vector3(0, 0, 0);
            this.airbornVelocity = new BABYLON.Vector3(0, 0, 0);
            this.movementVelocity = new BABYLON.Vector3(0, 0, 0);
            this.targetCameraOffset = new BABYLON.Vector3(0, 0, 0);
            //public getGroundHit():boolean { return this.groundHit; }
            //public getGroundNode():BABYLON.TransformNode { return this.groundNode; }
            //public getGroundPoint():BABYLON.Vector3 { return this.groundPoint; }
            //public getGroundAngle():number { return this.groundAngle; }
            //public getGroundNormal():BABYLON.Vector3 { return this.groundNormal; }
            //public getGroundDistance():number { return this.groundDistance; }
            //public getGroundCollision():boolean { return this.groundCollision; }
            this.rayClimbOffset = 0.35;
            this.rayClimbLength = 0.85;
            this.canClimbObstaclePredicate = null;
            this.rayHeightOffset = 5.0;
            this.rayHeightLength = 6.0;
            this.physicsWorld = null;
            this.abstractMesh = null;
            this.cameraDistance = 0;
            this.forwardCamera = true; // Note Always Camera Forward
            this.avatarRadius = 0.5;
            this.groundingMesh = null;
            this.groundingObject = null;
            this.groundingCallback = null;
            this.dollyDirection = new BABYLON.Vector3(0, 0, 0);
            this.cameraEulers = new BABYLON.Vector3(0, 0, 0);
            this.rotationEulers = new BABYLON.Vector3(0, 0, 0);
            this.cameraPivotOffset = new BABYLON.Vector3(0, 0, 0);
            this.cameraForwardVector = new BABYLON.Vector3(0, 0, 0);
            this.cameraRightVector = new BABYLON.Vector3(0, 0, 0);
            this.desiredForwardVector = new BABYLON.Vector3(0, 0, 0);
            this.desiredRightVector = new BABYLON.Vector3(0, 0, 0);
            this.scaledCamDirection = new BABYLON.Vector3(0, 0, 0);
            this.scaledMaxDirection = new BABYLON.Vector3(0, 0, 0);
            this.parentNodePosition = new BABYLON.Vector3(0, 0, 0);
            this.maximumCameraPos = new BABYLON.Vector3(0, 0, 0);
            this.tempWorldPosition = new BABYLON.Vector3(0, 0, 0);
            this.cameraRaycastShape = null;
            this.defaultRaycastGroup = UNITY.CollisionFilters.DefaultFilter;
            this.defaultRaycastMask = UNITY.CollisionFilters.StaticFilter;
            this.cameraRaycastMask = (UNITY.CollisionFilters.DefaultFilter | UNITY.CollisionFilters.StaticFilter | UNITY.CollisionFilters.KinematicFilter); // Note: Exclude The Player Character Controller From Camera Collision
            this.avatarSkins = null;
            this.cameraNode = null;
            this.cameraPivot = null;
            this.navigationAgent = null;
            this.characterController = null;
            this.verticalVelocity = 0;
            this.movementSpeed = 0;
            this.isRunPressed = false;
            this.isJumpPressed = false;
            this.isCharacterSliding = false;
            this.isCharacterFalling = false;
            this.isCharacterGrounded = false;
            this.isCharacterFallTriggered = false;
            this.isCharacterJumpFrame = false;
            this.isCharacterJumping = false;
            this.isCharacterLanding = false;
            this.isCharacterRising = false;
            this.isCharacterNavigating = false;
            this.navigationAngularSpeed = 0;
            this.updateStateParams = true;
            this.animationStateParams = null;
            this.sphereCollisionShape = null;
            this.hasGroundedContact = false;
            this.showDebugColliders = false;
            this.colliderVisibility = 0;
            this.colliderRenderGroup = 0;
            this.deltaTime = 0;
            this.minJumpTimer = 0;
            this.delayJumpTimer = 0;
            this.playerControl = 0;
            this.canPlayerJump = true;
            this.animationState = null;
            // DEPRECIATED: private rotationVelocityX:BABYLON.Vector2 = new BABYLON.Vector2(0,0);
            // DEPRECIATED: private rotationVelocityY:BABYLON.Vector2 = new BABYLON.Vector2(0,0);
            this.lastJumpVelocity = new BABYLON.Vector3(0, 0, 0);
            this.inputMovementVector = new BABYLON.Vector3(0, 0, 0);
            this.playerLookRotation = new BABYLON.Vector3(0, 0, 0);
            this.playerRotationVector = BABYLON.Vector2.Zero();
            this.playerMovementVelocity = new BABYLON.Vector3(0, 0, 0);
            this.playerRotationQuaternion = BABYLON.Quaternion.Zero();
            this.playerMoveDirection = PROJECT.PlayerMoveDirection.Stationary;
            //private groundHit:boolean = false;
            //private groundNode:BABYLON.TransformNode = null;
            //private groundAngle:number = 0;
            //private groundPoint:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            //private groundNormal:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            //private groundDistance:number = 0;
            //private groundCollision:boolean = false;
            //private groundVelocity:number = 0;
            //private groundSensorLine:UNITY.LinesMeshRenderer = null;
            //private offsetGroundRaycastPosition:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            //private startGroundRaycastPosition:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            //private endGroundRaycastPosition:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            this.forwardDirection = new BABYLON.Vector3(0, 0, 1);
            this.downDirection = new BABYLON.Vector3(0, -1, 0);
            this.climbContact = false;
            this.climbContactNode = null;
            this.climbContactAngle = 0;
            this.climbContactPoint = new BABYLON.Vector3(0, 0, 0);
            this.climbContactNormal = new BABYLON.Vector3(0, 0, 0);
            this.climbContactDistance = 0;
            this.climbSensorLine = null;
            this.offsetClimbRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            this.startClimbRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            this.endClimbRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            this.heightContact = false;
            this.heightContactNode = null;
            this.heightContactAngle = 0;
            this.heightContactPoint = new BABYLON.Vector3(0, 0, 0);
            this.heightContactNormal = new BABYLON.Vector3(0, 0, 0);
            this.heightContactDistance = 0;
            this.heightSensorLine = null;
            this.offsetHeightRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            this.startHeightRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            this.endHeightRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            this.m_velocityOffset = new BABYLON.Vector3(0, 0, 0);
            this.m_actualVelocity = new BABYLON.Vector3(0, 0, 0);
            this.m_linearVelocity = new BABYLON.Vector3(0, 0, 0);
            this.m_lastPosition = new BABYLON.Vector3(0, 0, 0);
            this.m_positionCenter = new BABYLON.Vector3(0, 0, 0);
            this.m_scaledVelocity = 0;
            this.playerDrawVelocity = 0;
            /** Register handler that is triggered before the controller has been updated */
            this.onPreUpdateObservable = new BABYLON.Observable();
            /** Register handler that is triggered before the controller movement has been applied */
            this.onBeforeMoveObservable = new BABYLON.Observable();
            /** Register handler that is triggered after the controller has been updated */
            this.onPostUpdateObservable = new BABYLON.Observable();
            /** Register handler that is triggered after player input has been updated */
            this.onPlayerInputObservable = new BABYLON.Observable();
            /** Register handler that is triggered when player position should be updated */
            this.onPlayerPositionObservable = new BABYLON.Observable();
            /** Register handler that is triggered after performing action has been updated */
            this.onUpdateActionObservable = new BABYLON.Observable();
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Root Motion Animation System
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            this._deltaMotionPosition = new BABYLON.Vector3(0, 0, 0);
            this._deltaMotionRotation = new BABYLON.Quaternion(0, 0, 0, 0);
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Blocking Action Animation System
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            this.isPerformingAction = false;
            this.isRootMotionAction = false;
            this.isActionInterruptable = false;
            this.afterActionHandler = null;
            this.performActionTimer = 0;
            this.performActionNumber = 0;
            this.playerRotationSpeed = 10;
            this.rotatePlayerTowards = false;
            this.matchStartTime = 0;
            this.matchTargetTime = 0;
            this.matchTargetOffset = 0;
            this.matchTargetHeight = false;
            this.lockTargetHeight = false;
            this.lastStartHeight = null;
            this.lastTargetHeight = null;
            this.lastTargetNormal = new BABYLON.Vector3(0, 0, 0);
            this.lastTargetRotation = new BABYLON.Quaternion(0, 0, 0, 1);
            this.lastDeltaPosition = new BABYLON.Vector3(0, 0, 0);
            this.lastDeltaRotation = new BABYLON.Quaternion(0, 0, 0, 1);
            this._ikLeftController = null;
            this._ikLeftFootTarget = null;
            this._ikLeftPoleTarget = null;
            this._ikRightController = null;
            this._ikRightFootTarget = null;
            this._ikRightPoleTarget = null;
            this.abstractSkinMesh = null;
            this.rootBoneTransform = null;
            this.leftFootTransform = null;
            //private leftFootPosition:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            this.leftFootPolePos = new BABYLON.Vector3(0, 0, 0);
            this.leftFootBendAxis = new BABYLON.Vector3(1, 0, 0);
            this.leftFootPoleAngle = 0;
            this.leftFootMaxAngle = 180;
            this.rightFootTransform = null;
            //private rightFootPosition:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            this.rightFootPolePos = new BABYLON.Vector3(0, 0, 0);
            this.rightFootBendAxis = new BABYLON.Vector3(1, 0, 0);
            this.rightFootPoleAngle = 0;
            this.rightFootMaxAngle = 180;
            this.smoothBoomArmLength = null;
            this.smoothBoomArmSpeed = null;
        }
        awake() { this.awakePlayerController(); }
        start() { this.startPlayerController(); }
        after() { this.afterPlayerController(); }
        update() { this.updatePlayerController(); }
        destroy() { this.destroyPlayerController(); }
        getDeltaMotionPosition() {
            this._deltaMotionPosition.set(0, 0, 0);
            if (this.animationState != null) {
                const rootMotionPosition = this.animationState.getDeltaRootMotionPosition();
                if (rootMotionPosition != null) {
                    // FIXME: Calculate Delta Root Motion Position
                    this._deltaMotionPosition.copyFrom(rootMotionPosition);
                }
            }
            return this._deltaMotionPosition;
        }
        getDeltaMotionRotation() {
            this._deltaMotionRotation.set(0, 0, 0, 0);
            if (this.animationState != null) {
                const rootMotionRotation = this.animationState.getDeltaRootMotionRotation();
                if (rootMotionRotation != null) {
                    // FIXME: Calculate Delta Root Motion Rotation
                    this._deltaMotionRotation.copyFrom(rootMotionRotation);
                }
            }
            return this._deltaMotionRotation;
        }
        getIsPerformingAction() { return this.isPerformingAction; }
        getIsRootMotionAction() { return this.isRootMotionAction; }
        getIsActionInterruptable() { return this.isActionInterruptable; }
        playActionAnimation(action, interruptableAction = true, enableRootMotion = false, afterActionComplete = null) {
            if (this.isPerformingAction === false && this.animationState != null && action >= 0) {
                this.isPerformingAction = true;
                this.performActionTimer = 0;
                this.performActionNumber = action;
                this.afterActionHandler = afterActionComplete;
                this.isActionInterruptable = interruptableAction;
                this.isRootMotionAction = enableRootMotion;
                this.playerRotationSpeed = 10;
                this.rotatePlayerTowards = false;
                this.matchStartTime = 0;
                this.matchTargetTime = 0;
                this.matchTargetOffset = 0;
                this.matchTargetHeight = false;
                this.lockTargetHeight = false;
                this.lastStartHeight = null;
                this.lastTargetHeight = null;
                this.lastTargetNormal.set(0, 0, 0);
                this.lastTargetRotation.set(0, 0, 0, 1);
                if (this.isRootMotionAction === true) {
                    this.enableCharacterController(false); // Note: Disable Character Controller
                }
                if (this.animationState != null) {
                    this.animationState.resetSmoothProperty(PROJECT.ThirdPersonPlayerController.PLAYER_HEIGHT);
                }
            }
        }
        resetActionAnimationState() {
            if (this.afterActionHandler != null) {
                try {
                    this.afterActionHandler();
                }
                catch (_a) { }
            }
            if (this.isRootMotionAction === true) {
                this.enableCharacterController(true); // Note: Enable Character Controller
            }
            if (this.animationState != null) {
                this.animationState.resetSmoothProperty(PROJECT.ThirdPersonPlayerController.PLAYER_HEIGHT);
            }
            this.performActionTimer = 0;
            this.performActionNumber = 0;
            this.isPerformingAction = false;
            this.isRootMotionAction = false;
            this.isActionInterruptable = false;
            this.afterActionHandler = null;
            this.playerRotationSpeed = 10;
            this.rotatePlayerTowards = false;
            this.matchStartTime = 0;
            this.matchTargetTime = 0;
            this.matchTargetOffset = 0;
            this.matchTargetHeight = false;
            this.lockTargetHeight = false;
            this.lastStartHeight = null;
            this.lastTargetHeight = null;
            this.lastTargetNormal.set(0, 0, 0);
            this.lastTargetRotation.set(0, 0, 0, 1);
        }
        updateAnimationActionState() {
            const deltaTime = this.getDeltaSeconds();
            const dampTime = (this.matchTargetTime - this.matchStartTime);
            if (this.animationState != null && this.isRootMotionAction === true) {
                const playerGlobalHeight = this.transform.absolutePosition.y;
                this.lastDeltaPosition.copyFrom(this.getDeltaMotionPosition());
                BABYLON.Vector3.TransformNormalToRef(this.lastDeltaPosition, this.transform.getWorldMatrix(), this.lastDeltaPosition);
                if (this.matchTargetHeight === true) {
                    if (this.lastStartHeight == null && this.performActionTimer >= this.matchStartTime) {
                        this.lastStartHeight = playerGlobalHeight;
                        this.animationState.resetSmoothProperty(PROJECT.ThirdPersonPlayerController.PLAYER_HEIGHT);
                        // console.warn(">>> Start Global Height: " + this.lastStartHeight + " --> Perform Action Timer: " + this.performActionTimer);
                    }
                    if (this.lastStartHeight != null && this.lastTargetHeight != null) {
                        this.lastDeltaPosition.y = 0;
                        const fixedTargetHeight = (this.lastTargetHeight + this.matchTargetOffset);
                        if (this.performActionTimer < this.matchTargetTime) {
                            this.animationState.setSmoothFloat(PROJECT.ThirdPersonPlayerController.PLAYER_HEIGHT, fixedTargetHeight, dampTime, deltaTime);
                            const smoothPlayerHeight = this.animationState.getFloat(PROJECT.ThirdPersonPlayerController.PLAYER_HEIGHT);
                            this.lastDeltaPosition.y = (smoothPlayerHeight - playerGlobalHeight);
                            // console.warn(">>> Lerp Target Delta: " + this.lastDeltaPosition.y + " --> Perform Action Timer: " + this.performActionTimer);
                        }
                        else if (this.lockTargetHeight === false && this.performActionTimer >= this.matchTargetTime) {
                            this.lastDeltaPosition.y = (fixedTargetHeight - playerGlobalHeight);
                            this.lockTargetHeight = true;
                            // console.warn(">>> Last Global Delta: " + this.lastDeltaPosition.y + " --> Perform Action Timer: " + this.performActionTimer + " ---> Match Target Time: " + this.matchTargetTime);
                        }
                    }
                }
                // ..
                // Apply Root Motion To Position
                // ..
                // this.lastDeltaPosition.x = 0; // FIXME: Apply Rotation Y Difference Factor From Unity
                // this.lastDeltaPosition.y = 0; // FIXME: Apply Rotation Y Difference Factor From Unity
                this.transform.position.addInPlace(this.lastDeltaPosition);
                // console.log("Player Action Height: " + playerGlobalHeight + " --> Perform Action Timer: " + this.performActionTimer);
                // console.log("Current Delta Height: " + this.lastDeltaPosition.y + " --> Perform Action Timer: " + this.performActionTimer);
                // ..
                // Apply Root Motion To Rotation
                // ..
                if (this.rotatePlayerTowards === true) {
                    if (this.climbContact === true) {
                        this.lastTargetNormal.set(-this.climbContactNormal.x, -this.climbContactNormal.y, -this.climbContactNormal.z);
                        UNITY.Utilities.LookRotationToRef(this.lastTargetNormal, this.lastTargetRotation);
                        const lerpAmount = BABYLON.Scalar.Clamp(this.playerRotationSpeed * deltaTime);
                        BABYLON.Quaternion.SlerpToRef(this.transform.rotationQuaternion, this.lastTargetRotation, lerpAmount, this.transform.rotationQuaternion);
                        //console.log("Climb Target Rotation: " + this.lastTargetRotation);
                    }
                }
                else {
                    this.lastDeltaRotation.copyFrom(this.getDeltaMotionRotation());
                    this.transform.rotationQuaternion.multiplyInPlace(this.lastDeltaRotation);
                }
            }
            this.performActionTimer += deltaTime;
        }
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Controller Attachment Functions
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /** Set the player world position */
        setWorldPosition(x, y, z) {
            if (this.characterController != null) {
                this.characterController.set(x, y, z);
            }
        }
        /** TODO */
        setPlayerControl(mode) {
            this.playerControl = mode;
            if (this.playerControl === PROJECT.PlayerInputControl.ThirdPersonStrafing) {
                this.showAvatarSkins(true);
            }
            else {
                this.showAvatarSkins(false);
            }
            this.forwardCamera = false; // NoteL Always False
        }
        /** TODO */
        togglePlayerControl() {
            if (this.toggleView === true) {
                if (this.playerControl === PROJECT.PlayerInputControl.FirstPersonStrafing) {
                    this.setPlayerControl(PROJECT.PlayerInputControl.ThirdPersonStrafing);
                }
                else {
                    this.setPlayerControl(PROJECT.PlayerInputControl.FirstPersonStrafing);
                }
            }
        }
        showAvatarSkins(show) {
            if (this.avatarSkins != null) {
                // TODO - Make Skins Visible Or Not TO Camera But Keep Shadows - ???
                this.avatarSkins.forEach((skin) => { skin.isVisible = show; });
            }
        }
        /** TODO */
        attachPlayerCamera(player) {
            if (this.cameraNode == null) {
                const playerCamera = (player <= 0 || player > 4) ? 1 : player;
                this.cameraNode = PROJECT.DefaultCameraSystem.GetCameraTransform(this.scene, playerCamera);
                if (this.cameraNode != null) {
                    this.cameraNode.parent = this.cameraPivot;
                    this.cameraNode.position.copyFrom(this.boomPosition);
                    this.cameraNode.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                    // ..
                    // const actualCamera:BABYLON.UniversalCamera = SM.FindSceneCameraRig(this.cameraNode) as BABYLON.UniversalCamera;
                    // if (actualCamera != null) actualCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(BABYLON.Tools.ToRadians(30),0,0);
                    // ..
                    // TODO - Move somewhere better - ???
                    // TODO - Handle Long Intitial Camera Pan - ???
                    // ..
                    this.cameraDistance = this.cameraNode.position.length();
                    this.dollyDirection.copyFrom(this.cameraNode.position);
                    this.dollyDirection.normalize();
                }
                else {
                    // DEBUG: UNITY.SceneManager.LogWarning("Failed to locate player camera for: " + this.transform.name);
                }
            }
        }
        getLeftFootTarget() { return this._ikLeftFootTarget; }
        getRightFootTarget() { return this._ikRightFootTarget; }
        getLeftFootController() { return this._ikLeftController; }
        getRightFootController() { return this._ikRightController; }
        attachBoneControllers() {
            const displayHandles = this.getProperty("displayHandles");
            const abstractSkinMeshData = this.getProperty("abstractSkinMesh");
            if (abstractSkinMeshData != null)
                this.abstractSkinMesh = this.getChildNode(abstractSkinMeshData.name, UNITY.SearchType.ExactMatch, false);
            const rootBoneTransformData = this.getProperty("rootBoneTransform");
            if (rootBoneTransformData != null)
                this.rootBoneTransform = this.getChildNode(rootBoneTransformData.name, UNITY.SearchType.ExactMatch, false);
            // ..
            const leftFootTransformData = this.getProperty("leftFootTransform");
            if (leftFootTransformData != null)
                this.leftFootTransform = this.getChildNode(leftFootTransformData.name, UNITY.SearchType.ExactMatch, false);
            //const leftFootPositionData:UNITY.IUnityVector3 = this.getProperty("leftFootPosition");
            //if (leftFootPositionData != null) this.leftFootPosition.copyFrom(UNITY.Utilities.ParseVector3(leftFootPositionData));
            const leftPoleHandleData = this.getProperty("leftFootPolePos");
            if (leftPoleHandleData != null)
                this.leftFootPolePos.copyFrom(UNITY.Utilities.ParseVector3(leftPoleHandleData));
            const leftBendAxisData = this.getProperty("leftFootBendAxis");
            if (leftBendAxisData != null)
                this.leftFootBendAxis.copyFrom(UNITY.Utilities.ParseVector3(leftBendAxisData));
            this.leftFootPoleAngle = this.getProperty("leftFootPoleAngle", this.leftFootPoleAngle);
            this.leftFootMaxAngle = this.getProperty("leftFootMaxAngle", this.leftFootMaxAngle);
            // ..
            const rightFootTransformData = this.getProperty("rightFootTransform");
            if (rightFootTransformData != null)
                this.rightFootTransform = this.getChildNode(rightFootTransformData.name, UNITY.SearchType.ExactMatch, false);
            //const rightFootPositionData:UNITY.IUnityVector3 = this.getProperty("rightFootPosition");
            //if (rightFootPositionData != null) this.rightFootPosition.copyFrom(UNITY.Utilities.ParseVector3(rightFootPositionData));
            const rightPoleHandleData = this.getProperty("rightFootPolePos");
            if (rightPoleHandleData != null)
                this.rightFootPolePos.copyFrom(UNITY.Utilities.ParseVector3(rightPoleHandleData));
            const rightBendAxisData = this.getProperty("rightFootBendAxis");
            if (rightBendAxisData != null)
                this.rightFootBendAxis.copyFrom(UNITY.Utilities.ParseVector3(rightBendAxisData));
            this.rightFootPoleAngle = this.getProperty("rightFootPoleAngle", this.rightFootPoleAngle);
            this.rightFootMaxAngle = this.getProperty("rightFootMaxAngle", this.rightFootMaxAngle);
            // ..
            if (this.abstractSkinMesh != null) {
                let materialName = "M_TARGET_MESH";
                let targetMaterial = this.scene.getMaterialByName(materialName);
                if (targetMaterial == null) {
                    targetMaterial = new BABYLON.StandardMaterial("M_TARGET_MESH", this.scene);
                    targetMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.5, 0.25);
                }
                // ..
                // Setup Left Foot Controller
                // ..
                if (this.leftFootTransform != null && this.leftFootTransform._linkedBone != null) {
                    this._ikLeftFootTarget = BABYLON.MeshBuilder.CreateBox(this.transform.name + ".LeftFootTarget", { width: 0.1, height: 0.1, depth: 0.1 }, this.scene);
                    this._ikLeftFootTarget.parent = this.abstractSkinMesh;
                    //this._ikLeftFootTarget.position.copyFrom(this.leftFootPosition);
                    if (this._ikLeftFootTarget instanceof BABYLON.AbstractMesh) {
                        this._ikLeftFootTarget.material = targetMaterial;
                        this._ikLeftFootTarget.isVisible = displayHandles;
                    }
                    // ..
                    this._ikLeftPoleTarget = BABYLON.MeshBuilder.CreateSphere(this.transform.name + ".LeftFootPole", { diameter: 0.15 }, this.scene);
                    this._ikLeftPoleTarget.parent = this.abstractSkinMesh;
                    this._ikLeftPoleTarget.position.copyFrom(this.leftFootPolePos);
                    if (this._ikLeftPoleTarget instanceof BABYLON.AbstractMesh) {
                        this._ikLeftPoleTarget.isVisible = displayHandles;
                    }
                    // ..
                    // this._ikLeftController = new BABYLON.BoneIKController(this.abstractSkinMesh, (<any>this.leftFootTransform)._linkedBone, {targetMesh:this._ikLeftFootTarget, poleTargetMesh:this._ikLeftPoleTarget, poleAngle:BABYLON.Tools.ToRadians(this.leftFootPoleAngle), bendAxis:this.leftFootBendAxis});
                    // this._ikLeftController.maxAngle = BABYLON.Tools.ToRadians(this.leftFootMaxAngle);
                }
                // ..
                // Setup Right Foot Controller
                // ..
                if (this.rightFootTransform != null && this.rightFootTransform._linkedBone != null) {
                    this._ikRightFootTarget = BABYLON.MeshBuilder.CreateBox(this.transform.name + ".RightFootTarget", { width: 0.1, height: 0.1, depth: 0.1 }, this.scene);
                    this._ikRightFootTarget.parent = this.abstractSkinMesh;
                    //this._ikRightFootTarget.position.copyFrom(this.rightFootPosition);
                    if (this._ikRightFootTarget instanceof BABYLON.AbstractMesh) {
                        this._ikRightFootTarget.material = targetMaterial;
                        this._ikRightFootTarget.isVisible = displayHandles;
                    }
                    // ..
                    this._ikRightPoleTarget = BABYLON.MeshBuilder.CreateSphere(this.transform.name + ".RightFootPole", { diameter: 0.15 }, this.scene);
                    this._ikRightPoleTarget.parent = this.abstractSkinMesh;
                    this._ikRightPoleTarget.position.copyFrom(this.rightFootPolePos);
                    if (this._ikRightPoleTarget instanceof BABYLON.AbstractMesh) {
                        this._ikRightPoleTarget.isVisible = displayHandles;
                    }
                    // ..
                    // this._ikRightController = new BABYLON.BoneIKController(this.abstractSkinMesh, (<any>this.rightFootTransform)._linkedBone, {targetMesh:this._ikRightFootTarget, poleTargetMesh:this._ikRightPoleTarget, poleAngle:BABYLON.Tools.ToRadians(this.rightFootPoleAngle), bendAxis:this.rightFootBendAxis});
                    // this._ikRightController.maxAngle = BABYLON.Tools.ToRadians(this.rightFootMaxAngle);
                }
            }
        }
        attachAnimationController() {
            if (this.animationState == null) {
                this.animationState = this.getComponent("UNITY.AnimationState");
                if (this.animationState == null) {
                    const animationNode = this.getChildWithScript("UNITY.AnimationState");
                    if (animationNode != null) {
                        this.animationState = UNITY.SceneManager.FindScriptComponent(animationNode, "UNITY.AnimationState");
                    }
                    else {
                        // DEBUG: UNITY.SceneManager.LogWarning("Failed to locate animator node for: " + this.transform);
                    }
                }
            }
            if (this.animationState != null) {
                this.animationState.onAnimationEndObservable.add(() => {
                    if (this.isPerformingAction === true) {
                        //console.log("Animation End: " + this.transform.name);
                        this.resetActionAnimationState();
                    }
                });
                this.animationState.onAnimationUpdateObservable.add(() => {
                    if (this.animationState.ikFrameEnabled() === true) {
                        // FIXME: Update target mesh position When Grounded - Use Raycast - ???
                        if (this._ikLeftController != null) {
                            this._ikLeftController.update();
                        }
                        if (this._ikRightController != null) {
                            this._ikRightController.update();
                        }
                    }
                });
            }
        }
        /** TODO */
        enableCharacterController(state) {
            if (state === true) {
                this.movementAllowed = true;
                this.resetPlayerJumpingState();
                if (this.characterController != null) {
                    ////this.characterController.syncGhostToTransformPosition();
                    ////this.characterController.syncMovementState();
                    ////this.characterController.syncTransformToGhostPosition();
                    this.characterController.setGravity(this.gravitationalForce);
                    this.characterController.setFallingSpeed(this.terminalVelocity);
                    this.characterController.setGhostCollisionState(true);
                    this.characterController.updatePosition = true;
                }
            }
            else {
                this.movementAllowed = false;
                this.resetPlayerJumpingState();
                if (this.characterController != null) {
                    this.characterController.setGravity(0);
                    this.characterController.setFallingSpeed(0);
                    this.characterController.setGhostCollisionState(false);
                    ////this.characterController.syncGhostToTransformPosition();
                    this.characterController.updatePosition = false;
                }
            }
        }
        /** TODO */
        resetPlayerRotation() {
            this.transform.rotationQuaternion.toEulerAnglesToRef(this.rotationEulers);
            this.playerRotationVector.x = this.rotationEulers.x;
            this.playerRotationVector.y = this.rotationEulers.y;
        }
        /** TODO */
        resetPlayerJumpingState() {
            this.minJumpTimer = 0;
            this.isCharacterJumping = false;
            this.isCharacterLanding = false;
            this.isCharacterRising = false;
            this.isCharacterJumpFrame = false;
            if (this.characterController != null) {
                this.characterController.jump(0); // Note: Zero Jump Speed
            }
        }
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Controller Worker Functions
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        awakePlayerController() {
            this.gravitationalForce = this.getProperty("gravitationalForce", this.gravitationalForce);
            this.terminalVelocity = this.getProperty("terminalVelocity", this.terminalVelocity);
            this.rotateCamera = this.getProperty("rotateCamera", this.rotateCamera);
            this.mouseWheel = this.getProperty("mouseWheel", this.mouseWheel);
            //this.normalAngle = this.getProperty("normalAngle", this.normalAngle);
            //this.radiusScale = this.getProperty("radiusScale", this.radiusScale);
            //this.rayLength = this.getProperty("rayLength", this.rayLength);
            //this.rayOrigin = this.getProperty("rayOrigin", this.rayOrigin);
            this.detectionRadius = this.getProperty("detectionRadius", this.detectionRadius);
            this.verticalOffset = this.getProperty("verticalOffset", this.verticalOffset);
            this.forwardOffset = this.getProperty("forwardOffset", this.forwardOffset);
            this.rayClimbLength = this.getProperty("rayClimbLength", this.rayClimbLength);
            this.rayClimbOffset = this.getProperty("rayClimbOffset", this.rayClimbOffset);
            this.rayHeightLength = this.getProperty("rayHeightLength", this.rayHeightLength);
            this.rayHeightOffset = this.getProperty("rayHeightOffset", this.rayHeightOffset);
            this.maxAngle = this.getProperty("maxAngle", this.maxAngle);
            this.landingEpsilon = this.getProperty("landingEpsilon", this.landingEpsilon);
            this.minFallVelocity = this.getProperty("minFallVelocity", this.minFallVelocity);
            this.airbornTimeout = this.getProperty("airbornTimeout", this.airbornTimeout);
            this.rootMotion = this.getProperty("rootMotion", this.rootMotion);
            this.moveSpeed = this.getProperty("moveSpeed", this.moveSpeed);
            this.walkSpeed = this.getProperty("walkSpeed", this.walkSpeed);
            this.lookSpeed = this.getProperty("lookSpeed", this.lookSpeed);
            this.jumpSpeed = this.getProperty("jumpSpeed", this.jumpSpeed);
            this.jumpDelay = this.getProperty("jumpDelay", this.jumpDelay);
            this.eyesHeight = this.getProperty("eyesHeight", this.eyesHeight);
            this.pivotHeight = this.getProperty("pivotHeight", this.pivotHeight);
            this.maxDistance = this.getProperty("maxDistance", this.maxDistance);
            this.scrollSpeed = this.getProperty("scrollSpeed", this.scrollSpeed);
            this.topLookLimit = this.getProperty("topLookLimit", this.topLookLimit);
            this.downLookLimit = this.getProperty("downLookLimit", this.downLookLimit);
            this.lowTurnSpeed = this.getProperty("lowTurnSpeed", this.lowTurnSpeed);
            this.highTurnSpeed = this.getProperty("highTurnSpeed", this.highTurnSpeed);
            // DEPRECIATED: this.smoothingSpeed = this.getProperty("smoothingSpeed", this.smoothingSpeed);
            this.enableInput = this.getProperty("enableInput", this.enableInput);
            this.playerNumber = this.getProperty("playerNumber", this.playerNumber);
            this.attachCamera = this.getProperty("attachCamera", this.attachCamera);
            this.freeLooking = this.getProperty("freeLooking", this.freeLooking);
            this.toggleView = this.getProperty("toggleView", this.toggleView);
            this.avatarSkinTag = this.getProperty("avatarSkinTag", this.avatarSkinTag);
            this.runKeyRequired = this.getProperty("runKeyRequired", this.runKeyRequired);
            this.cameraCollisions = this.getProperty("cameraCollisions", this.cameraCollisions);
            this.cameraSmoothing = this.getProperty("cameraSmoothing", this.cameraSmoothing);
            this.distanceFactor = this.getProperty("distanceFactor", this.distanceFactor);
            this.minimumDistance = this.getProperty("minimumDistance", this.minimumDistance);
            this.smoothMotionTime = this.getProperty("smoothMotionTime", this.smoothMotionTime);
            this.smoothInputVectors = this.getProperty("smoothInputVectors", this.smoothInputVectors);
            this.smoothAcceleration = this.getProperty("smoothAcceleration", this.smoothAcceleration);
            this.accelerationSpeed = this.getProperty("accelerationSpeed", this.accelerationSpeed);
            this.decelerationSpeed = this.getProperty("decelerationSpeed", this.decelerationSpeed);
            this.climbVolumeTag = this.getProperty("climbVolumeTag", this.climbVolumeTag);
            this.vaultVolumeTag = this.getProperty("vaultVolumeTag", this.vaultVolumeTag);
            this.useClimbSystem = this.getProperty("useClimbSystem", this.useClimbSystem);
            this.maxHeightRanges = this.getProperty("maxHeightRanges", this.maxHeightRanges);
            this.ignoreTriggerTags = this.getProperty("ignoreTriggerTags", this.ignoreTriggerTags);
            this.updateStateParams = this.getProperty("updateStateParams", this.updateStateParams);
            this.animationStateParams = this.getProperty("animationStateParams", this.animationStateParams);
            this.postNetworkAttributes = this.getProperty("postNetworkAttributes", this.postNetworkAttributes);
            // ..
            const arrowKeyRotation = this.getProperty("arrowKeyRotation");
            if (arrowKeyRotation === true)
                UNITY.UserInputOptions.UseArrowKeyRotation = true;
            // ..
            const boomPositionData = this.getProperty("boomPosition");
            if (boomPositionData != null)
                this.boomPosition = UNITY.Utilities.ParseVector3(boomPositionData);
            // ..
            const sphereRadius = this.getProperty("sphereRadius", 0.5);
            //this.cameraRaycastShape = UNITY.RigidbodyPhysics.CreatePhysicsSphereShape(sphereRadius);
            // ..
            this.abstractMesh = this.getAbstractMesh();
            this.showDebugColliders = UNITY.Utilities.ShowDebugColliders();
            this.colliderVisibility = UNITY.Utilities.ColliderVisibility();
            this.colliderRenderGroup = UNITY.Utilities.ColliderRenderGroup();
            // Note: Get Avatar Skins First Thing
            if (this.avatarSkinTag != null && this.avatarSkinTag !== "") {
                this.avatarSkins = this.getChildrenWithTags(this.avatarSkinTag, false);
            }
            const pcontrol = this.getProperty("playerControl", this.playerControl);
            this.setPlayerControl(pcontrol);
            this.resetPlayerRotation();
            // ..
            /*
            this.physicsWorld = UNITY.RigidbodyPhysics.GetPhysicsWorld(this.scene);
            this.groundingMesh = BABYLON.MeshBuilder.CreateSphere("GroundingMesh", { segments: 24, diameter: (this.detectionRadius * 2), }, this.scene);
            this.groundingMesh.setParent(this.transform);
            this.groundingMesh.position.set(0, this.verticalOffset, this.forwardOffset);
            this.groundingMesh.rotationQuaternion = new BABYLON.Quaternion(0,0,0,1);
            this.groundingMesh.material = UNITY.Utilities.GetColliderMaterial(this.scene);
            this.groundingMesh.isVisible = this.showDebugColliders;
            this.groundingMesh.visibility = this.colliderVisibility;
            this.groundingMesh.renderingGroupId = this.colliderRenderGroup;
            UNITY.RigidbodyPhysics.CreatePhysicsImpostor(this.scene, this.groundingMesh, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 0 });
            this.groundingMesh.physicsImpostor.executeNativeFunction((word:any, body:any) => {
                this.groundingObject = Ammo.castObject(body, Ammo.btCollisionObject);
                this.groundingCallback = new Ammo.ConcreteContactResultCallback();
                this.groundingCallback.m_collisionFilterGroup = UNITY.CollisionFilters.KinematicFilter;
                this.groundingCallback.m_collisionFilterMask = UNITY.CollisionFilters.DefaultFilter | UNITY.CollisionFilters.StaticFilter;
                this.groundingCallback.addSingleResult = (cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1) => {
                    // KEEP FOR REFERENCE
                    // const contactPoint = Ammo.wrapPointer(cp, Ammo.btManifoldPoint);
                    // const colObj0Wrapper:any = Ammo.wrapPointer(colObj0Wrap, Ammo.btCollisionObjectWrapper);
                    // const colobj0:any = colObj0Wrapper.getCollisionObject();
                    // const entity0:BABYLON.TransformNode = (colobj0 != null && colobj0.entity != null) ? colobj0.entity : null;
                    // let contactEntity:BABYLON.TransformNode = null;
                    // if (colObj1Wrap != null) {
                    //    const colObj1Wrapper:any = Ammo.wrapPointer(colObj1Wrap, Ammo.btCollisionObjectWrapper);
                    //    if (colObj1Wrapper != null) {
                    //        const colobj1:any = colObj1Wrapper.getCollisionObject();
                    //        contactEntity = (colobj1 != null && colobj1.entity != null) ? colobj1.entity : null;
                    //    }
                    // }
                    // if (contactEntity != null) {
                    //    this.hasGroundedContact = true;
                    //    // console.log("Ground Contact Mesh: " + contactEntity.name);
                    // }
                    this.hasGroundedContact = true;
                };
                if (body.activate) body.activate();
                // ..
                // Set Collision Flags
                // ..
                if (body.setCollisionFlags && body.getCollisionFlags) {
                    body.setCollisionFlags(body.getCollisionFlags() | BABYLON.CollisionFlags.CF_NO_CONTACT_RESPONSE);       // TRIGGER_OBJECT
                    body.setCollisionFlags(body.getCollisionFlags() | BABYLON.CollisionFlags.CF_KINEMATIC_OBJECT);          // STATIC_OBJECT
                    body.setCollisionFlags(body.getCollisionFlags() | BABYLON.CollisionFlags.CF_CUSTOM_MATERIAL_CALLBACK);  // CUSTOM_MATERIAL
                }
                // ..
                // Set Collision Masks
                // ..
                if (body.getBroadphaseProxy) {
                    body.getBroadphaseProxy().set_m_collisionFilterGroup(UNITY.CollisionFilters.KinematicFilter)
                    body.getBroadphaseProxy().set_m_collisionFilterMask(UNITY.CollisionFilters.DefaultFilter | UNITY.CollisionFilters.StaticFilter)
                }
            });
            */
            // ..
            this.cameraPivot = new BABYLON.Mesh(this.transform.name + ".CameraPivot", this.scene);
            this.cameraPivot.parent = null;
            this.cameraPivot.position = this.transform.position.clone();
            this.cameraPivot.rotationQuaternion = this.transform.rotationQuaternion.clone();
            this.cameraPivot.checkCollisions = false;
            this.cameraPivot.isPickable = false;
            // ..
            if (this.showDebugColliders === true) {
                const testPivot = BABYLON.MeshBuilder.CreateBox("TestPivot", { width: 0.25, height: 0.25, depth: 0.5 }, this.scene);
                testPivot.parent = this.cameraPivot;
                testPivot.position.set(0, 0, 0);
                testPivot.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                testPivot.visibility = 0.5;
                testPivot.renderingGroupId = this.colliderRenderGroup;
                testPivot.checkCollisions = false;
                testPivot.isPickable = false;
            }
            // ..
            const cylinderShape = this.getProperty("cylinderShape");
            const configController = this.getComponent("UNITY.CharacterController");
            if (configController != null && cylinderShape === true)
                configController.preCreateCylinderShape();
            // ..
            // Setup IK Bone Controllers
            // ..
            this.attachBoneControllers();
            // ..
            UNITY.InputController.OnKeyboardPress(this.keyboardCamera, () => { this.togglePlayerControl(); });
            UNITY.InputController.OnGamepadButtonPress(this.buttonCamera, () => { this.togglePlayerControl(); });
        }
        startPlayerController() {
            // TODO - Support Dynamic PlayerNumber Change - ???
            if (this.attachCamera === true) {
                this.attachPlayerCamera(this.playerNumber);
            }
            this.navigationAgent = this.getComponent("UNITY.NavigationAgent");
            this.characterController = this.getComponent("UNITY.CharacterController");
            if (this.characterController != null) {
                this.avatarRadius = this.characterController.getAvatarRadius();
                this.characterController.setGravity(this.gravitationalForce);
                this.characterController.setFallingSpeed(this.terminalVelocity);
                //this.characterController.onUpdatePositionObservable.add(() => {
                //    this.updatePlayerPosition();
                //    this.updateCameraController();
                //});
                UNITY.SceneManager.LogWarning("Starting player controller in physic engine mode for: " + this.transform.name);
            }
            else {
                UNITY.SceneManager.LogWarning("No character controller found for: " + this.transform.name);
            }
            // Set player window state variable
            // SM.SetWindowState("player", this);
        }
        updatePlayerPosition() {
            if (this.onPlayerPositionObservable && this.onPlayerPositionObservable.hasObservers()) {
                this.onPlayerPositionObservable.notifyObservers(this.transform);
            }
        }
        updatePlayerController() {
            this.deltaTime = this.getDeltaSeconds();
            //this.smoothDeltaTime = UNITY.System.SmoothDeltaFactor * this.deltaTime + (1 - UNITY.System.SmoothDeltaFactor) * this.smoothDeltaTime;
            // ..
            this.m_actualVelocity = this.transform.absolutePosition.subtract(this.m_lastPosition);
            this.m_linearVelocity.copyFrom(this.m_actualVelocity);
            this.m_scaledVelocity = (this.m_linearVelocity.length() / this.deltaTime);
            this.m_linearVelocity.normalize();
            this.m_linearVelocity.scaleInPlace(this.m_scaledVelocity);
            if (this.playerDrawVelocity > 0) {
                this.m_velocityOffset.copyFrom(this.m_linearVelocity);
                this.m_velocityOffset.scaleInPlace(this.playerDrawVelocity);
            }
            else {
                this.m_velocityOffset.set(0, 0, 0);
            }
            this.m_lastPosition.copyFrom(this.transform.absolutePosition);
            // TODO - FIX THIS SHIT
            if (this.updateStateParams === true && this.animationState == null) {
                this.attachAnimationController();
            }
            // ..
            if (this.minJumpTimer > 0) {
                this.minJumpTimer -= this.deltaTime;
                if (this.minJumpTimer < 0)
                    this.minJumpTimer = 0;
            }
            if (this.isCharacterGrounded === true && this.delayJumpTimer > 0) {
                this.delayJumpTimer -= this.deltaTime;
                if (this.delayJumpTimer < 0)
                    this.delayJumpTimer = 0;
            }
            // ..
            this.canPlayerJump = true;
            if (this.isPerformingAction === true) {
                this.updateAnimationActionState();
                if (this.onUpdateActionObservable && this.onUpdateActionObservable.hasObservers()) {
                    this.onUpdateActionObservable.notifyObservers(this.transform);
                }
            }
            if (this.enableInput === false)
                return;
            const userInputX = UNITY.InputController.GetUserInput(UNITY.UserInputAxis.Horizontal, this.playerNumber);
            const userInputZ = UNITY.InputController.GetUserInput(UNITY.UserInputAxis.Vertical, this.playerNumber);
            const userMouseX = UNITY.InputController.GetUserInput(UNITY.UserInputAxis.MouseX, this.playerNumber);
            const userMouseY = UNITY.InputController.GetUserInput(UNITY.UserInputAxis.MouseY, this.playerNumber);
            if (this.smoothAcceleration === true) {
                // SMOOTH USER INPUT X
                if (userInputX > 0) {
                    this.playerInputX += (this.accelerationSpeed * this.deltaTime);
                    if (this.playerInputX > 1)
                        this.playerInputX = 1;
                }
                else if (userInputX < 0) {
                    this.playerInputX -= (this.accelerationSpeed * this.deltaTime);
                    if (this.playerInputX < -1)
                        this.playerInputX = -1;
                }
                else {
                    if (this.playerInputX < 0) {
                        this.playerInputX += (this.decelerationSpeed * this.deltaTime);
                        if (this.playerInputX > 0)
                            this.playerInputX = 0;
                    }
                    else if (this.playerInputX > 0) {
                        this.playerInputX -= (this.decelerationSpeed * this.deltaTime);
                        if (this.playerInputX < 0)
                            this.playerInputX = 0;
                    }
                }
                // SMOOTH USER INPUT Z
                if (userInputZ > 0) {
                    this.playerInputZ += (this.accelerationSpeed * this.deltaTime);
                    if (this.playerInputZ > 1)
                        this.playerInputZ = 1;
                }
                else if (userInputZ < 0) {
                    this.playerInputZ -= (this.accelerationSpeed * this.deltaTime);
                    if (this.playerInputZ < -1)
                        this.playerInputZ = -1;
                }
                else {
                    if (this.playerInputZ < 0) {
                        this.playerInputZ += (this.decelerationSpeed * this.deltaTime);
                        if (this.playerInputZ > 0)
                            this.playerInputZ = 0;
                    }
                    else if (this.playerInputZ > 0) {
                        this.playerInputZ -= (this.decelerationSpeed * this.deltaTime);
                        if (this.playerInputZ < 0)
                            this.playerInputZ = 0;
                    }
                }
            }
            else {
                // RAW USER INPUT XZ
                this.playerInputX = userInputX;
                this.playerInputZ = userInputZ;
            }
            // ..
            this.playerMouseX = userMouseX;
            this.playerMouseY = userMouseY;
            // ..
            // Validate Animation Action
            // ..
            if (this.isPerformingAction === true && this.isActionInterruptable === true) {
                if (this.playerInputX !== 0 || this.playerInputZ !== 0) {
                    //console.log("Animation Interrupt: " + this.transform.name);
                    this.resetActionAnimationState();
                }
            }
            if (this.isPerformingAction === true) {
                this.canPlayerJump = false;
                this.playerInputX = 0;
                this.playerInputZ = 0;
            }
            // ..
            // Update Player Input
            // ..
            if (this.onPlayerInputObservable && this.onPlayerInputObservable.hasObservers()) {
                this.onPlayerInputObservable.notifyObservers(this.transform);
            }
            //..
            // Update Input Magnitude
            // ..
            this.inputMovementVector.set(this.playerInputX, 0, this.playerInputZ);
            if (this.inputMovementVector.length() > 1.0)
                this.inputMovementVector.normalize(); // Note: Normalize In Place
            this.inputMagnitude = this.inputMovementVector.length();
            // ..
            // Update Move Direction
            // ..
            const moveForward = (this.playerInputZ > 0);
            const moveBackward = (this.playerInputZ < 0);
            const moveRight = (this.playerInputX > 0);
            const moveLeft = (this.playerInputX < 0);
            if (moveForward === true) {
                if (moveLeft === true) {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.ForwardLeft;
                }
                else if (moveRight === true) {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.ForwardRight;
                }
                else {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.Forward;
                }
            }
            else if (moveBackward === true) {
                if (moveLeft === true) {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.BackwardLeft;
                }
                else if (moveRight === true) {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.BackwardRight;
                }
                else {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.Backward;
                }
            }
            else if (moveLeft === true) {
                this.playerMoveDirection = PROJECT.PlayerMoveDirection.StrafingLeft;
            }
            else if (moveRight === true) {
                this.playerMoveDirection = PROJECT.PlayerMoveDirection.StrafingRight;
            }
            else {
                this.playerMoveDirection = PROJECT.PlayerMoveDirection.Stationary;
            }
            // ..
            // Update Pre Notifications
            // ..
            if (this.onPreUpdateObservable && this.onPreUpdateObservable.hasObservers()) {
                this.onPreUpdateObservable.notifyObservers(this.transform);
            }
            // ..
            // Update Forward Camera Vector
            // ..
            this.cameraForwardVector.copyFrom(this.cameraPivot.forward);
            this.cameraForwardVector.y = 0;
            this.cameraForwardVector.normalize();
            this.cameraForwardVector.scaleToRef(this.playerInputZ, this.desiredForwardVector);
            // ..
            // Update Right Camera Vector
            // ..
            this.cameraRightVector.copyFrom(this.cameraPivot.right);
            this.cameraRightVector.y = 0;
            this.cameraRightVector.normalize();
            this.cameraRightVector.scaleToRef(this.playerInputX, this.desiredRightVector);
            // ..
            // Update Player Rotation Vector
            // ..
            this.playerRotationVector.y += (this.playerMouseX * this.lookSpeed * this.deltaTime);
            this.playerRotationVector.x += (-this.playerMouseY * this.lookSpeed * this.deltaTime);
            this.playerRotationVector.x = BABYLON.Scalar.Clamp(this.playerRotationVector.x, -BABYLON.Tools.ToRadians(this.downLookLimit), BABYLON.Tools.ToRadians(this.topLookLimit));
            if (this.movementAllowed === false) {
                this.canPlayerJump = false;
                this.playerInputX = 0;
                this.playerInputZ = 0;
            }
            // ..
            // Smooth Player Rotation Vector (DEPRECIATED)
            // ..
            // let newPlayerRotationVectorY = this.playerRotationVector.y + (this.playerMouseX * this.lookSpeed * this.deltaTime);
            // let newPlayerRotationVectorX = this.playerRotationVector.x + (-this.playerMouseY * this.lookSpeed * this.deltaTime);
            // newPlayerRotationVectorX = BABYLON.Scalar.Clamp(newPlayerRotationVectorX, -BABYLON.Tools.ToRadians(this.downLookLimit), BABYLON.Tools.ToRadians(this.topLookLimit));
            // this.playerRotationVector.x = UNITY.Utilities.SmoothDampAngle(this.playerRotationVector.x, newPlayerRotationVectorX, this.smoothingSpeed, Number.MAX_VALUE, this.deltaTime, this.rotationVelocityX);
            // this.playerRotationVector.y = UNITY.Utilities.SmoothDampAngle(this.playerRotationVector.y, newPlayerRotationVectorY, this.smoothingSpeed, Number.MAX_VALUE, this.deltaTime, this.rotationVelocityY);
            // ..
            // Update Player Button Presses
            // ..
            this.isRunPressed = (UNITY.InputController.GetKeyboardInput(this.keyboardRun) || UNITY.InputController.GetGamepadButtonInput(this.buttonRun));
            this.isJumpPressed = (UNITY.InputController.GetKeyboardInput(this.keyboardJump) || UNITY.InputController.GetGamepadButtonInput(this.buttonJump));
            // ..
            // Update Player Movement Velocity
            // ..
            this.movementSpeed = (this.inputMagnitude * this.moveSpeed * this.speedFactor);
            if (this.runKeyRequired === true && this.isRunPressed === false) {
                // ..
                // TODO: Lerp Max Speed From Walk To Run And Vice Versa (Smooth Out Transitions)
                // ..
                this.movementSpeed = BABYLON.Scalar.Clamp(this.movementSpeed, 0, this.walkSpeed);
            }
            this.desiredForwardVector.addToRef(this.desiredRightVector, this.playerMovementVelocity);
            this.playerMovementVelocity.scaleInPlace(this.movementSpeed);
            if (this.movementAllowed === true) {
                if (this.playerControl === PROJECT.PlayerInputControl.FirstPersonStrafing) {
                    // TODO: Handle Root Motion Rotation
                    // No Free Looking - Snap Player Rotation (Euler Angle Rotation)
                    BABYLON.Quaternion.FromEulerAnglesToRef(0, this.playerRotationVector.y, 0, this.transform.rotationQuaternion);
                }
                else if (this.playerControl === PROJECT.PlayerInputControl.ThirdPersonStrafing) {
                    // Validate Free Looking Rotation
                    if (this.freeLooking === true) {
                        if (this.inputMagnitude > 0) {
                            // FIXME - Note: Large Movement - Slerp Player Rotation (Euler Angle Rotation)
                            const strafingTurnRatio = (this.playerMovementVelocity.length() / this.moveSpeed);
                            const strafingTurnSpeed = BABYLON.Scalar.Lerp(this.highTurnSpeed, this.lowTurnSpeed, strafingTurnRatio);
                            BABYLON.Quaternion.FromEulerAnglesToRef(0, this.playerRotationVector.y, 0, this.playerRotationQuaternion);
                            // TODO: Handle Root Motion Rotation
                            BABYLON.Quaternion.SlerpToRef(this.transform.rotationQuaternion, this.playerRotationQuaternion, (strafingTurnSpeed * this.deltaTime), this.transform.rotationQuaternion);
                        }
                    }
                    else {
                        // TODO: Handle Root Motion Rotation
                        // No Free Looking - Snap Player Rotation (Euler Angle Rotation)
                        BABYLON.Quaternion.FromEulerAnglesToRef(0, this.playerRotationVector.y, 0, this.transform.rotationQuaternion);
                    }
                }
            }
            this.verticalVelocity = this.getVerticalVelocity();
            this.movementVelocity.copyFrom(this.playerMovementVelocity);
            // ..
            // Update Character Controller
            // ..
            this.hasGroundedContact = false;
            this.isCharacterGrounded = false;
            this.isCharacterSliding = false;
            this.isCharacterFalling = false;
            this.isCharacterJumpFrame = false;
            this.isCharacterNavigating = (this.navigationAgent != null && this.navigationAgent.isNavigating());
            this.navigationAngularSpeed = (this.navigationAgent != null) ? this.navigationAgent.angularSpeed : 0;
            this.updateCharacterController();
            // ..
            // Update Animation State Params
            // ..
            if (this.animationState != null && this.updateStateParams === true) {
                this.validateAnimationStateParams();
                this.animationState.setInteger(this.animationStateParams.moveDirection, this.playerMoveDirection);
                this.animationState.setFloat(this.animationStateParams.heightInput, this.verticalVelocity);
                this.animationState.setBool(this.animationStateParams.jumpFrame, this.isCharacterJumpFrame);
                this.animationState.setBool(this.animationStateParams.jumpState, this.isCharacterJumping);
                this.animationState.setInteger(this.animationStateParams.actionState, this.performActionNumber);
                this.animationState.setBool(this.animationStateParams.fallingState, this.isCharacterFalling);
                this.animationState.setBool(this.animationStateParams.slidingState, this.isCharacterSliding);
                this.animationState.setBool(this.animationStateParams.groundedState, this.isCharacterGrounded);
                if (this.smoothMotionTime > 0) {
                    if (this.smoothInputVectors === true) {
                        this.animationState.setSmoothFloat(this.animationStateParams.horizontalInput, this.playerInputX, this.smoothMotionTime, this.deltaTime);
                        this.animationState.setSmoothFloat(this.animationStateParams.verticalInput, this.playerInputZ, this.smoothMotionTime, this.deltaTime);
                        this.animationState.setSmoothFloat(this.animationStateParams.mouseXInput, this.playerMouseX, this.smoothMotionTime, this.deltaTime);
                        this.animationState.setSmoothFloat(this.animationStateParams.mouseYInput, this.playerMouseY, this.smoothMotionTime, this.deltaTime);
                    }
                    else {
                        this.animationState.setFloat(this.animationStateParams.horizontalInput, this.playerInputX);
                        this.animationState.setFloat(this.animationStateParams.verticalInput, this.playerInputZ);
                        this.animationState.setFloat(this.animationStateParams.mouseXInput, this.playerMouseX);
                        this.animationState.setFloat(this.animationStateParams.mouseYInput, this.playerMouseY);
                    }
                    this.animationState.setSmoothFloat(this.animationStateParams.inputMagnitude, this.inputMagnitude, this.smoothMotionTime, this.deltaTime);
                    this.animationState.setSmoothFloat(this.animationStateParams.speedInput, this.movementSpeed, this.smoothMotionTime, this.deltaTime);
                }
                else {
                    this.animationState.setFloat(this.animationStateParams.horizontalInput, this.playerInputX);
                    this.animationState.setFloat(this.animationStateParams.verticalInput, this.playerInputZ);
                    this.animationState.setFloat(this.animationStateParams.mouseXInput, this.playerMouseX);
                    this.animationState.setFloat(this.animationStateParams.mouseYInput, this.playerMouseY);
                    this.animationState.setFloat(this.animationStateParams.inputMagnitude, this.inputMagnitude);
                    this.animationState.setFloat(this.animationStateParams.speedInput, this.movementSpeed);
                }
                if (this.isCharacterNavigating === true) {
                    // TODO - Update Speed Input With Navigation Magnitude
                    // this.animationState.setFloat(this.animationStateParams.speedInput, this.inputMagnitude);
                }
            }
            // ..
            // Post Network Attributes
            // ..
            if (this.postNetworkAttributes == true && UNITY.EntityController.HasNetworkEntity(this.transform)) {
                UNITY.EntityController.PostBufferedAttribute(this.transform, 0, this.playerMoveDirection); // Direction
                UNITY.EntityController.PostBufferedAttribute(this.transform, 1, this.inputMagnitude); // Magnitude
                UNITY.EntityController.PostBufferedAttribute(this.transform, 2, this.playerInputX); // Horizonal
                UNITY.EntityController.PostBufferedAttribute(this.transform, 3, this.playerInputZ); // Vertical
                UNITY.EntityController.PostBufferedAttribute(this.transform, 4, this.playerMouseX); // MouseX
                UNITY.EntityController.PostBufferedAttribute(this.transform, 5, this.playerMouseY); // MouseY
                UNITY.EntityController.PostBufferedAttribute(this.transform, 6, this.verticalVelocity); // Vertical Velocity
                UNITY.EntityController.PostBufferedAttribute(this.transform, 7, this.movementSpeed); // Movement Speed
                UNITY.EntityController.PostBufferedAttribute(this.transform, 8, this.performActionNumber); // Action State
                UNITY.EntityController.PostBufferedAttribute(this.transform, 9, ((this.isCharacterJumpFrame) ? 1 : 0)); // Jump Frame
                UNITY.EntityController.PostBufferedAttribute(this.transform, 10, ((this.isCharacterJumping) ? 1 : 0)); // Is Jumping
                UNITY.EntityController.PostBufferedAttribute(this.transform, 11, ((this.isCharacterFalling) ? 1 : 0)); // Is Falling
                UNITY.EntityController.PostBufferedAttribute(this.transform, 12, ((this.isCharacterSliding) ? 1 : 0)); // Is Sliding
                UNITY.EntityController.PostBufferedAttribute(this.transform, 13, ((this.isCharacterGrounded) ? 1 : 0)); // Is Grounded
            }
            // ..
            // Update Post Notifications
            // ..
            if (this.onPostUpdateObservable && this.onPostUpdateObservable.hasObservers()) {
                this.onPostUpdateObservable.notifyObservers(this.transform);
            }
        }
        afterPlayerController() {
        }
        // FIXME: Extra Raycast Distance When On Various Slope Angles - ???
        updateCharacterController() {
            if (this.characterController != null) {
                if (this.groundingMesh != null) {
                    this.groundingMesh.position.set(0, this.verticalOffset, this.forwardOffset);
                }
                if (this.physicsWorld != null && this.physicsWorld.contactTest != null && this.groundingObject != null && this.groundingCallback != null) {
                    this.physicsWorld.contactTest(this.groundingObject, this.groundingCallback);
                }
                this.isCharacterRising = (this.isCharacterJumping == true && this.verticalVelocity > 0);
                this.isCharacterLanding = (this.isCharacterJumping == true && this.verticalVelocity < 0);
                if (this.isCharacterRising == true) {
                    this.hasGroundedContact = false; // IGNORE CONTACT
                }
                if (this.hasGroundedContact === true && this.minJumpTimer <= 0) {
                    this.isCharacterSliding = false; // NOT SLIDING
                    this.isCharacterGrounded = true; // IS GROUNDED
                }
                //this.castPhysicsGroundCheckRay();
                //const slopeAngleLength:number = 0; // TODO: Account For Current Slope Angle - ???
                //const minGroundDistanceLength:number = (PROJECT.StandardPlayerController.MIN_GROUND_DISTANCE + slopeAngleLength);
                //this.groundCollision = (this.groundHit === true && this.groundDistance <= minGroundDistanceLength && (this.normalAngle <= 0 || this.groundNormal.y >= this.normalAngle));
                //if (this.groundCollision === true && this.minJumpTimer <= 0) {
                //    if (this.verticalVelocity === 0 || (this.groundAngle > 0 && this.verticalVelocity > 0)) {
                //        this.isCharacterSliding = false;    // NOT SLIDING
                //        this.isCharacterGrounded = true;    // IS GROUNDED
                //    } else if (this.groundAngle > 0 && this.verticalVelocity < 0) {
                //        this.isCharacterSliding = true;     // IS SLIDING
                //        this.isCharacterGrounded = false;   // NOT GROUNDED
                //    }
                //}
                if (this.isCharacterGrounded === true)
                    this.isCharacterJumping = false;
                this.isCharacterFalling = (this.isCharacterGrounded === false && this.isCharacterSliding == false && this.isCharacterJumping == false && this.verticalVelocity < 0 && Math.abs(this.verticalVelocity) >= this.minFallVelocity);
                if (this.isCharacterFalling === true && this.isCharacterFallTriggered === false) {
                    this.isCharacterFallTriggered = true;
                    if (this.jumpDelay > 0)
                        this.delayJumpTimer = this.jumpDelay; // DUNNO: MAYBE USE SEPERATE FALLING DELAY TIMER - ???
                }
                if (this.isCharacterGrounded === true)
                    this.isCharacterFallTriggered = false;
                // WM.PrintToScreen("Is Grounded: " + this.isCharacterGrounded);
                // ..
                // Update Climbing System
                // ..
                if (this.useClimbSystem === true) {
                    this.castPhysicsClimbingVolumeRay();
                    this.castPhysicsHeightCheckVolumeRay();
                }
                // ..
                // Process Character Movement
                // ..
                //if (this.movementAllowed === false) return;
                if (this.isCharacterNavigating === false && this.movementAllowed === true) {
                    if (this.isCharacterGrounded === true) {
                        if (this.delayJumpTimer <= 0)
                            this.isCharacterJumpFrame = (this.canPlayerJump === true && this.isJumpPressed === true);
                        if (this.isPerformingAction === false && this.isCharacterJumpFrame === true && this.useClimbSystem === true && this.climbContact === true && this.heightContact === true) {
                            let climbAction = -1;
                            let rotateSpeed = 1;
                            let rotateTowards = false;
                            let matchHeight = false;
                            let startTime = 0;
                            let targetTime = 0;
                            let targetOffset = 0;
                            const hitHeight = parseFloat(this.heightContactPoint.y.toFixed(2));
                            const playerHeight = parseFloat(this.transform.position.y.toFixed(2));
                            const obstacleHeight = parseFloat((hitHeight - playerHeight).toFixed(2));
                            //console.log("Climb Action -->  Hit Height: " + hitHeight + " --> Player Height: " + playerHeight + " --> Obstacle Height: " + obstacleHeight + " --> Rotate Towards: " + rotateTowards);
                            if (obstacleHeight >= this.maxHeightRanges.stepUpRange.minimumHeight && obstacleHeight <= this.maxHeightRanges.stepUpRange.maximumHeight) {
                                climbAction = PROJECT.ActionAnimationType.StepUp;
                                rotateSpeed = this.maxHeightRanges.stepUpRange.rotationSpeed;
                                rotateTowards = this.maxHeightRanges.stepUpRange.rotateTowards;
                                matchHeight = this.maxHeightRanges.stepUpRange.matchHeight;
                                startTime = this.maxHeightRanges.stepUpRange.startTime;
                                targetTime = this.maxHeightRanges.stepUpRange.targetTime;
                                targetOffset = this.maxHeightRanges.stepUpRange.targetOffset;
                            }
                            else if (obstacleHeight >= this.maxHeightRanges.jumpUpRange.minimumHeight && obstacleHeight <= this.maxHeightRanges.jumpUpRange.maximumHeight) {
                                climbAction = PROJECT.ActionAnimationType.JumpUp;
                                rotateSpeed = this.maxHeightRanges.jumpUpRange.rotationSpeed;
                                rotateTowards = this.maxHeightRanges.jumpUpRange.rotateTowards;
                                matchHeight = this.maxHeightRanges.jumpUpRange.matchHeight;
                                startTime = this.maxHeightRanges.jumpUpRange.startTime;
                                targetTime = this.maxHeightRanges.jumpUpRange.targetTime;
                                targetOffset = this.maxHeightRanges.jumpUpRange.targetOffset;
                            }
                            else if (obstacleHeight >= this.maxHeightRanges.climbUpRange.minimumHeight && obstacleHeight <= this.maxHeightRanges.climbUpRange.maximumHeight) {
                                climbAction = PROJECT.ActionAnimationType.ClimbUp;
                                rotateSpeed = this.maxHeightRanges.climbUpRange.rotationSpeed;
                                rotateTowards = this.maxHeightRanges.climbUpRange.rotateTowards;
                                matchHeight = this.maxHeightRanges.climbUpRange.matchHeight;
                                startTime = this.maxHeightRanges.climbUpRange.startTime;
                                targetTime = this.maxHeightRanges.climbUpRange.targetTime;
                                targetOffset = this.maxHeightRanges.climbUpRange.targetOffset;
                            }
                            if (climbAction >= 0) {
                                if (this.canClimbObstaclePredicate == null || this.canClimbObstaclePredicate(climbAction) === true) {
                                    this.isCharacterJumpFrame = false;
                                    this.isCharacterJumping = false;
                                    this.isCharacterLanding = false;
                                    this.isCharacterRising = false;
                                    this.playActionAnimation(climbAction, false, true);
                                    this.playerRotationSpeed = rotateSpeed;
                                    this.rotatePlayerTowards = rotateTowards;
                                    this.matchTargetHeight = matchHeight;
                                    this.matchStartTime = (startTime - PROJECT.ThirdPersonPlayerController.MIN_TIMER_OFFSET);
                                    this.matchTargetTime = (targetTime - PROJECT.ThirdPersonPlayerController.MIN_TIMER_OFFSET);
                                    this.matchTargetOffset = targetOffset;
                                    this.lastTargetHeight = hitHeight;
                                    this.lastStartHeight = null;
                                    this.lockTargetHeight = false;
                                }
                            }
                        }
                        if (this.isCharacterJumpFrame === true && this.jumpSpeed > 0) {
                            this.isCharacterJumping = true;
                            this.characterController.jump(this.jumpSpeed);
                            if (this.jumpDelay > 0)
                                this.delayJumpTimer = this.jumpDelay;
                            if (this.airbornTimeout > 0)
                                this.minJumpTimer = (this.airbornTimeout + this.deltaTime);
                            this.lastJumpVelocity.set(this.movementVelocity.x, 0, this.movementVelocity.z);
                        }
                        // ..
                        // Update Move Notifications
                        // ..
                        if (this.onBeforeMoveObservable && this.onBeforeMoveObservable.hasObservers()) {
                            this.onBeforeMoveObservable.notifyObservers(this.transform);
                        }
                        // ..
                        // Validate Root Motion Velocity
                        // ..
                        if (this.animationState != null && this.rootMotion === true) {
                            const rootMotion = this.getDeltaMotionPosition();
                            this.movementVelocity.set(rootMotion.x, 0, rootMotion.z);
                            BABYLON.Vector3.TransformNormalToRef(this.movementVelocity, this.transform.getWorldMatrix(), this.movementVelocity);
                            this.characterController.move(this.movementVelocity);
                        }
                        else {
                            this.movementVelocity.scaleInPlace(this.deltaTime);
                            this.characterController.move(this.movementVelocity);
                        }
                    }
                    // this.characterController.updatePosition = true; - Which Is Best - ???
                }
                else {
                    // this.characterController.updatePosition = false; - Which Is Best - ???
                    // FIXME: EITHER OR - ???
                    // this.characterController.setGhostWorldPosition(this.transform.position);
                    this.characterController.syncGhostToTransformPosition();
                }
            }
        }
        updateCameraController() {
            if (this.enableInput === false)
                return;
            // DUNNO FUR SURE:  if (this.isCharacterNavigating === true && this.navigationAngularSpeed > 0) allowRotation = false;
            if (this.cameraPivot != null) {
                // .. 
                // Update Camera Pivot Offset
                // ..
                if (this.targetCameraOffset.x !== 0 || this.targetCameraOffset.y !== 0 || this.targetCameraOffset.z !== 0) {
                    this.cameraPivotOffset.copyFrom(this.targetCameraOffset);
                }
                else {
                    if (this.playerControl === PROJECT.PlayerInputControl.ThirdPersonStrafing) {
                        this.cameraPivotOffset.set(0, this.pivotHeight, 0);
                    }
                    else {
                        this.cameraPivotOffset.set(0, this.eyesHeight, 0);
                    }
                }
                // ..
                // Update Camera Pivot Position
                // ..
                UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.cameraPivot.position, this.cameraPivotOffset);
                // ..
                // Update Camera Pivot Rotation
                // ..
                if (this.rotateCamera === true) {
                    BABYLON.Quaternion.FromEulerAnglesToRef(this.playerRotationVector.x, this.playerRotationVector.y, 0, this.cameraPivot.rotationQuaternion);
                }
            }
            if (this.rotateCamera === true && this.cameraNode != null) {
                if (this.cameraSmoothing <= 0)
                    this.cameraSmoothing = 5.0; // Default Camera Smoothing
                if (this.playerControl === PROJECT.PlayerInputControl.ThirdPersonStrafing) {
                    if (this.cameraCollisions === true) {
                        // ..
                        // Check Camera Collision
                        // ..
                        // const maxDistance:number = Math.abs(this.boomPosition.z);
                        const parentNode = this.cameraNode.parent;
                        this.dollyDirection.scaleToRef(this.maxDistance, this.scaledMaxDirection);
                        this.dollyDirection.scaleToRef(this.cameraDistance, this.scaledCamDirection);
                        UNITY.Utilities.GetAbsolutePositionToRef(parentNode, this.parentNodePosition);
                        UNITY.Utilities.TransformPointToRef(parentNode, this.scaledMaxDirection, this.maximumCameraPos);
                        // ..
                        let contact = false;
                        let distance = 0;
                        if (this.characterController != null) {
                            // Note: Use Bullet Physics Shape Cast
                            //const raycast:UNITY.RaycastHitResult = UNITY.RigidbodyPhysics.PhysicsShapecastToPoint(this.scene, this.cameraRaycastShape, this.parentNodePosition, this.maximumCameraPos, this.defaultRaycastGroup, this.cameraRaycastMask);
                            //contact = (raycast != null && raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null);
                            //distance = (raycast != null && raycast.hasHit === true) ? raycast.hitDistance : 0;
                            //if (contact === true) {
                            //    const contactTag:string = SM.GetTransformTag(raycast.collisionObject.entity);
                            //    if (this.ignoreTriggerTags != null && this.ignoreTriggerTags !== "" && this.ignoreTriggerTags.indexOf(contactTag) >= 0) {
                            //        contact = false;
                            //        distance = 0;
                            //    }
                            //}
                        }
                        if (contact /* === true*/) {
                            this.cameraDistance = BABYLON.Scalar.Clamp((distance * this.distanceFactor), this.minimumDistance, this.maxDistance);
                            // Lerp Past Camera Collisions
                            if (this.cameraNode.position.x !== this.scaledCamDirection.x || this.cameraNode.position.y !== this.scaledCamDirection.y || this.cameraNode.position.z !== this.scaledCamDirection.z) {
                                BABYLON.Vector3.LerpToRef(this.cameraNode.position, this.scaledCamDirection, (this.deltaTime * this.cameraSmoothing), this.cameraNode.position);
                            }
                        }
                        else {
                            if (this.mouseWheel === true) {
                                if (UNITY.InputController.IsWheelScrolling()) {
                                    const wheel = UNITY.InputController.GetUserInput(UNITY.UserInputAxis.Wheel);
                                    if (wheel < 0) { // ZOOM OUT
                                        const zoomOutSpeed = (this.scrollSpeed * this.deltaTime);
                                        this.boomPosition.z = BABYLON.Scalar.MoveTowards(this.boomPosition.z, -this.maxDistance, zoomOutSpeed);
                                    }
                                    else if (wheel > 0) { // ZOOM IN
                                        const zoomInSpeed = (this.scrollSpeed * this.deltaTime);
                                        this.boomPosition.z = BABYLON.Scalar.MoveTowards(this.boomPosition.z, -this.minimumDistance, zoomInSpeed);
                                    }
                                }
                            }
                            // Lerp To Camera Boom Position
                            if (this.cameraNode.position.x !== this.boomPosition.x || this.cameraNode.position.y !== this.boomPosition.y || this.cameraNode.position.z !== this.boomPosition.z) {
                                BABYLON.Vector3.LerpToRef(this.cameraNode.position, this.boomPosition, (this.deltaTime * this.cameraSmoothing), this.cameraNode.position);
                            }
                        }
                    }
                    else {
                        // Lerp To Camera Boom Position
                        if (this.cameraNode.position.x !== this.boomPosition.x || this.cameraNode.position.y !== this.boomPosition.y || this.cameraNode.position.z !== this.boomPosition.z) {
                            BABYLON.Vector3.LerpToRef(this.cameraNode.position, this.boomPosition, (this.deltaTime * this.cameraSmoothing), this.cameraNode.position);
                        }
                    }
                }
                else {
                    // Note: Snap To Zero Camera Pivot Position - First Person View
                    if (this.cameraNode.position.x !== 0 || this.cameraNode.position.y !== 0 || this.cameraNode.position.z !== 0) {
                        this.cameraNode.position.set(0, 0, 0);
                    }
                }
            }
            this.updateSmoothBoomArmLength();
        }
        getBoomArmMaxDistance() { return this.maxDistance; }
        setBoomArmMaxDistance(distance) { this.maxDistance = Math.abs(distance); }
        setSmoothBoomArmLength(length, speed, updateMaxDistance = true) {
            const absoluteLength = Math.abs(length);
            this.smoothBoomArmLength = -absoluteLength;
            this.smoothBoomArmSpeed = speed;
            if (updateMaxDistance === true) {
                const absoluteDistance = Math.abs(this.maxDistance);
                if (absoluteLength > absoluteDistance) {
                    this.setBoomArmMaxDistance(absoluteLength);
                }
            }
        }
        updateSmoothBoomArmLength() {
            if (this.smoothBoomArmLength != null && this.smoothBoomArmSpeed != null) {
                if (this.boomPosition.z !== this.smoothBoomArmLength) {
                    this.boomPosition.z = BABYLON.Scalar.MoveTowards(this.boomPosition.z, this.smoothBoomArmLength, (this.smoothBoomArmSpeed * this.getDeltaSeconds()));
                }
                else {
                    this.smoothBoomArmLength = null;
                    this.smoothBoomArmSpeed = null;
                }
            }
        }
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //  Ammo Physics Raycasting
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /*
        private castPhysicsGroundCheckRay():void {
            this.groundHit = false;
            this.groundNode = null;
            this.groundPoint.set(0,0,0);
            this.groundNormal.set(0,0,0);
            this.groundAngle = 0;
            this.groundDistance = 0;
            if (this.rayLength <= 0) this.rayLength = 0.1;
            const raycastLength:number = (this.rayLength / this.transform.scaling.y) + 0.1;
            // ..
            // Grounding Raycast Positions
            // ..
            const playerTransformDownDirection = UTIL.TransformDirection(this.transform, this.downDirection);
            this.offsetGroundRaycastPosition.set(0, this.rayOrigin, 0);
            UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.startGroundRaycastPosition, this.offsetGroundRaycastPosition);
            UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.endGroundRaycastPosition, this.downDirection.scale(raycastLength));
            this.endGroundRaycastPosition.y += this.rayOrigin;
            // ..
            // Cast Collision Shape Ray
            // ..
            if (this.radiusScale <= 0) this.radiusScale = 1.0;
            if (this.sphereCollisionShape == null) this.sphereCollisionShape = UNITY.SceneManager.CreatePhysicsSphereShape(this.avatarRadius * this.radiusScale);
            const raycast:UNITY.RaycastHitResult = UNITY.SceneManager.PhysicsShapecast(this.scene, this.sphereCollisionShape, this.startGroundRaycastPosition, playerTransformDownDirection, raycastLength, this.defaultRaycastGroup, this.defaultRaycastMask);
            // DEPRECIATED: const raycast:UNITY.RaycastHitResult = UNITY.SceneManager.PhysicsRaycast(this.scene, this.startGroundRaycastPosition, playerTransformDownDirection, raycastLength, this.defaultRaycastGroup, this.defaultRaycastMask);
            if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                this.groundHit = true;
                this.groundNode = raycast.collisionObject.entity;
                if (raycast.hitPoint != null) this.groundPoint.copyFrom(raycast.hitPoint);
                if (raycast.hitNormal != null) this.groundNormal.copyFrom(raycast.hitNormal);
                this.groundAngle = (this.groundHit === true) ? Math.abs(UNITY.Utilities.GetAngle(this.groundNormal, BABYLON.Vector3.UpReadOnly)) : 0;
                if (this.groundAngle >= 88) this.groundAngle = 0; // Note: Zero Max 88 Degree Ground Angle
                this.groundDistance = (raycast.hitDistance - this.rayOrigin);
            }
            // Ground Draw Debug Line
            if (this.showDebugColliders === true) {
                if (this.groundSensorLine == null) this.groundSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".GroundSensorLine", this.scene);
                if (this.groundHit === true) {
                    this.groundSensorLine.drawLine([this.startGroundRaycastPosition, raycast.hitPoint], BABYLON.Color3.Red());
                } else {
                  this.groundSensorLine.drawLine([this.startGroundRaycastPosition, this.endGroundRaycastPosition], BABYLON.Color3.Green());
                }
            }
        }
        */
        castPhysicsClimbingVolumeRay() {
            let raycast = null;
            this.climbContact = false;
            this.climbContactNode = null;
            this.climbContactPoint.set(0, 0, 0);
            this.climbContactNormal.set(0, 0, 0);
            this.climbContactAngle = 0;
            this.climbContactDistance = 0;
            // ..
            // Climbing Raycast Positions
            // ..
            const playerTransformForwardDirection = UTIL.TransformDirection(this.transform, this.forwardDirection);
            this.offsetClimbRaycastPosition.set(0, this.rayClimbOffset, 0);
            UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.startClimbRaycastPosition, this.offsetClimbRaycastPosition);
            UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.endClimbRaycastPosition, this.forwardDirection.scale(this.rayClimbLength));
            this.endClimbRaycastPosition.y += this.rayClimbOffset;
            // ..
            //raycast = UNITY.RigidbodyPhysics.PhysicsRaycast(this.scene, this.startClimbRaycastPosition, playerTransformForwardDirection, this.rayClimbLength, this.defaultRaycastGroup, this.defaultRaycastMask);
            if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                const checkTag = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                if (checkTag === this.climbVolumeTag) {
                    this.climbContact = true;
                    this.climbContactNode = raycast.collisionObject.entity;
                    if (raycast.hitPoint != null)
                        this.climbContactPoint.copyFrom(raycast.hitPoint);
                    if (raycast.hitNormal != null)
                        this.climbContactNormal.copyFrom(raycast.hitNormal);
                    this.climbContactAngle = (this.climbContactNormal != null) ? Math.abs(UNITY.Utilities.GetAngle(this.climbContactNormal, BABYLON.Vector3.UpReadOnly)) : 0;
                    this.climbContactDistance = raycast.hitDistance;
                }
            }
            // Climbing Draw Debug Line
            if (this.showDebugColliders === true) {
                if (this.climbSensorLine == null)
                    this.climbSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".ClimbingSensorLine", this.scene);
                if (this.climbContact === true) {
                    this.climbSensorLine.drawLine([this.startClimbRaycastPosition, raycast.hitPoint], BABYLON.Color3.Red());
                }
                else {
                    this.climbSensorLine.drawLine([this.startClimbRaycastPosition, this.endClimbRaycastPosition], BABYLON.Color3.Green());
                }
            }
        }
        castPhysicsHeightCheckVolumeRay() {
            let raycast = null;
            this.heightContact = false;
            this.heightContactNode = null;
            this.heightContactPoint.set(0, 0, 0);
            this.heightContactNormal.set(0, 0, 0);
            this.heightContactAngle = 0;
            this.heightContactDistance = 0;
            // ..
            // Height Check Raycast Positions
            // ..
            const playerTransformHeightDirection = UTIL.TransformDirection(this.transform, this.downDirection);
            if (this.climbContact === true) {
                this.endHeightRaycastPosition.copyFrom(this.climbContactPoint);
                this.startHeightRaycastPosition.copyFrom(this.climbContactPoint);
                this.startHeightRaycastPosition.addInPlace(BABYLON.Vector3.UpReadOnly.scale(this.rayHeightLength));
                //raycast = UNITY.RigidbodyPhysics.PhysicsRaycast(this.scene, this.startHeightRaycastPosition, playerTransformHeightDirection, this.rayHeightLength, this.defaultRaycastGroup, this.defaultRaycastMask);
            }
            else {
                this.offsetHeightRaycastPosition.set(0, this.rayHeightOffset, this.rayClimbLength);
                UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.startHeightRaycastPosition, this.offsetHeightRaycastPosition);
                this.endHeightRaycastPosition.copyFrom(this.startHeightRaycastPosition);
                this.endHeightRaycastPosition.addInPlace(this.downDirection.scale(this.rayHeightLength));
            }
            // ..
            if (raycast != null && raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                const checkTag = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                if (checkTag === this.climbVolumeTag) {
                    this.heightContact = true;
                    this.heightContactNode = raycast.collisionObject.entity;
                    if (raycast.hitPoint != null)
                        this.heightContactPoint.copyFrom(raycast.hitPoint);
                    if (raycast.hitNormal != null)
                        this.heightContactNormal.copyFrom(raycast.hitNormal);
                    this.heightContactAngle = (this.heightContactNormal != null) ? Math.abs(UNITY.Utilities.GetAngle(this.heightContactNormal, BABYLON.Vector3.UpReadOnly)) : 0;
                    this.heightContactDistance = raycast.hitDistance;
                }
            }
            // Height Check Draw Debug Line
            if (this.showDebugColliders === true) {
                if (this.heightSensorLine == null)
                    this.heightSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".HeightCheckSensorLine", this.scene);
                if (raycast != null && this.heightContact === true) {
                    this.heightSensorLine.drawLine([this.startHeightRaycastPosition, raycast.hitPoint], BABYLON.Color3.Red());
                }
                else {
                    this.heightSensorLine.drawLine([this.startHeightRaycastPosition, this.endHeightRaycastPosition], BABYLON.Color3.Green());
                }
            }
        }
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //  Private Worker Functions
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        getCheckedVerticalVelocity() {
            const currentVelocity = (this.characterController != null) ? this.characterController.getVerticalVelocity() : 0;
            return (Math.abs(currentVelocity) >= PROJECT.StandardPlayerController.MIN_VERTICAL_VELOCITY) ? currentVelocity : 0;
        }
        destroyPlayerController() {
            this.cameraPivot = null;
            this.cameraNode = null;
            this.animationState = null;
            this.characterController = null;
            this.onPreUpdateObservable.clear();
            this.onPreUpdateObservable = null;
            this.onBeforeMoveObservable.clear();
            this.onBeforeMoveObservable = null;
            this.onPostUpdateObservable.clear();
            this.onPostUpdateObservable = null;
        }
        validateAnimationStateParams() {
            if (this.animationStateParams == null) {
                this.animationStateParams = {
                    moveDirection: "Direction",
                    inputMagnitude: "Magnitude",
                    horizontalInput: "Horizontal",
                    verticalInput: "Vertical",
                    mouseXInput: "MouseX",
                    mouseYInput: "MouseY",
                    heightInput: "Height",
                    speedInput: "Speed",
                    jumpFrame: "Jumped",
                    jumpState: "Jump",
                    actionState: "Action",
                    fallingState: "FreeFall",
                    slidingState: "Sliding",
                    groundedState: "Grounded",
                };
            }
        }
    }
    StandardPlayerController.MIN_VERTICAL_VELOCITY = 0.01;
    StandardPlayerController.MIN_GROUND_DISTANCE = 0.15;
    StandardPlayerController.MIN_MOVE_EPSILON = 0.001;
    StandardPlayerController.MIN_TIMER_OFFSET = 0;
    StandardPlayerController.MIN_SLOPE_LIMIT = 0;
    StandardPlayerController.PLAYER_HEIGHT = "playerHeight";
    PROJECT.StandardPlayerController = StandardPlayerController;
    /**
    * Babylon Enum Definition
    * @interface PlayerInputControl
    */
    let PlayerInputControl;
    (function (PlayerInputControl) {
        PlayerInputControl[PlayerInputControl["FirstPersonStrafing"] = 0] = "FirstPersonStrafing";
        PlayerInputControl[PlayerInputControl["ThirdPersonStrafing"] = 1] = "ThirdPersonStrafing";
    })(PlayerInputControl = PROJECT.PlayerInputControl || (PROJECT.PlayerInputControl = {}));
    /**
    * Babylon Enum Definition
    * @interface PlayerMoveDirection
    */
    let PlayerMoveDirection;
    (function (PlayerMoveDirection) {
        PlayerMoveDirection[PlayerMoveDirection["Stationary"] = 0] = "Stationary";
        PlayerMoveDirection[PlayerMoveDirection["Forward"] = 1] = "Forward";
        PlayerMoveDirection[PlayerMoveDirection["ForwardLeft"] = 2] = "ForwardLeft";
        PlayerMoveDirection[PlayerMoveDirection["ForwardRight"] = 3] = "ForwardRight";
        PlayerMoveDirection[PlayerMoveDirection["Backward"] = 4] = "Backward";
        PlayerMoveDirection[PlayerMoveDirection["BackwardLeft"] = 5] = "BackwardLeft";
        PlayerMoveDirection[PlayerMoveDirection["BackwardRight"] = 6] = "BackwardRight";
        PlayerMoveDirection[PlayerMoveDirection["StrafingLeft"] = 7] = "StrafingLeft";
        PlayerMoveDirection[PlayerMoveDirection["StrafingRight"] = 8] = "StrafingRight";
    })(PlayerMoveDirection = PROJECT.PlayerMoveDirection || (PROJECT.PlayerMoveDirection = {}));
    /**
    * Babylon Enum Definition
    * @interface ActionAnimationType
    */
    let ActionAnimationType;
    (function (ActionAnimationType) {
        ActionAnimationType[ActionAnimationType["Neutral"] = 0] = "Neutral";
        ActionAnimationType[ActionAnimationType["StepUp"] = 1] = "StepUp";
        ActionAnimationType[ActionAnimationType["JumpUp"] = 2] = "JumpUp";
        ActionAnimationType[ActionAnimationType["ClimbUp"] = 3] = "ClimbUp";
        ActionAnimationType[ActionAnimationType["VaultOver"] = 4] = "VaultOver";
    })(ActionAnimationType = PROJECT.ActionAnimationType || (PROJECT.ActionAnimationType = {}));
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
     * Babylon toolkit third person player controller class
     * @class ThirdPersonPlayerController - All rights reserved (c) 2020 Mackey Kinard
    */
    class ThirdPersonPlayerController extends UNITY.ScriptComponent {
        isAnimationEnabled() { return this.updateStateParams; }
        isRunButtonPressed() { return this.isRunPressed; }
        isJumpButtonPressed() { return this.isJumpPressed; }
        getPlayerJumped() { return this.isCharacterJumpFrame; }
        getPlayerJumping() { return this.isCharacterJumping; }
        getPlayerFalling() { return this.isCharacterFalling; }
        getPlayerSliding() { return this.isCharacterSliding; }
        getPlayerGrounded() { return this.isCharacterGrounded; }
        getFallTriggered() { return this.isCharacterFallTriggered; }
        getMovementSpeed() { return this.movementSpeed; }
        getCameraBoomNode() { return this.cameraNode; }
        getCameraTransform() { return this.cameraPivot; }
        getAnimationState() { return this.animationState; }
        getVerticalVelocity() { return this.getCheckedVerticalVelocity(); }
        getCharacterController() { return this.characterController; }
        getPlayerLookRotation() { return this.playerLookRotation; }
        getPlayerMoveDirection() { return this.playerMoveDirection; }
        getInputMovementVector() { return this.inputMovementVector; }
        getInputMagnitudeValue() { return this.inputMagnitude; }
        getCameraPivotPosition() { return (this.cameraPivot != null) ? this.cameraPivot.position : null; }
        getCameraPivotRotation() { return (this.cameraPivot != null) ? this.cameraPivot.rotationQuaternion : null; }
        getClimbContact() { return this.climbContact; }
        getClimbContactNode() { return this.climbContactNode; }
        getClimbContactPoint() { return this.climbContactPoint; }
        getClimbContactAngle() { return this.climbContactAngle; }
        getClimbContactNormal() { return this.climbContactNormal; }
        getClimbContactDistance() { return this.climbContactDistance; }
        ;
        getHeightContact() { return this.heightContact; }
        getHeightContactNode() { return this.heightContactNode; }
        getHeightContactPoint() { return this.heightContactPoint; }
        getHeightContactAngle() { return this.heightContactAngle; }
        getHeightContactNormal() { return this.heightContactNormal; }
        getHeightContactDistance() { return this.heightContactDistance; }
        ;
        setGavityForce(gravity) {
            this.gravitationalForce = gravity;
            if (this.characterController != null) {
                this.characterController.setGravity(this.gravitationalForce);
            }
        }
        setFallingSpeed(velocity) {
            this.terminalVelocity = velocity;
            if (this.characterController != null) {
                this.characterController.setFallingSpeed(this.terminalVelocity);
            }
        }
        constructor(transform, scene, properties) {
            super(transform, scene, properties);
            this.enableInput = false;
            this.attachCamera = false;
            this.rotateCamera = true;
            this.mouseWheel = true;
            this.freeLooking = false;
            this.requireSprintButton = false;
            this.gravitationalForce = 29.4;
            this.terminalVelocity = 55.0;
            this.minFallVelocity = 1.0;
            this.airbornTimeout = 0.5;
            this.detectionRadius = 0.22;
            this.verticalOffset = 0.08;
            this.forwardOffset = 0.0;
            //public normalAngle:number = 0.6;
            //public radiusScale:number = 0.5;
            //public rayLength:number = 10;
            //public rayOrigin:number = 1;
            this.maxAngle = 45;
            this.speedFactor = 1.0;
            this.rootMotion = false;
            this.moveSpeed = 6.0;
            this.walkSpeed = 2.0;
            this.lookSpeed = 2.0;
            this.jumpSpeed = 10.0;
            this.jumpDelay = 0.25;
            this.eyesHeight = 1.0;
            this.pivotHeight = 1.0;
            this.maxDistance = 5.0;
            this.scrollSpeed = 25;
            this.topLookLimit = 60.0;
            this.downLookLimit = 30.0;
            this.lowTurnSpeed = 15.0;
            this.highTurnSpeed = 25.0;
            // DEPRECIATED: public smoothingSpeed:number = 0.12;
            this.smoothMotionTime = 0;
            this.smoothInputVectors = false;
            this.smoothAcceleration = false;
            this.accelerationSpeed = 0.1;
            this.decelerationSpeed = 0.1;
            this.climbVolumeTag = "Climb";
            this.vaultVolumeTag = "Vault";
            this.maxHeightRanges = null;
            this.useClimbSystem = false;
            this.distanceFactor = 0.85;
            this.cameraSmoothing = 5;
            this.cameraCollisions = true;
            this.inputMagnitude = 0;
            this.landingEpsilon = 0.1;
            this.minimumDistance = 0.85;
            this.movementAllowed = true;
            this.playerInputX = 0;
            this.playerInputZ = 0;
            this.playerMouseX = 0;
            this.playerMouseY = 0;
            this.runKeyRequired = true;
            this.ignoreTriggerTags = null;
            this.buttonRun = BABYLON.Xbox360Button.LeftStick;
            this.keyboardRun = UNITY.UserInputKey.Shift;
            this.buttonJump = BABYLON.Xbox360Button.A;
            this.keyboardJump = UNITY.UserInputKey.SpaceBar;
            this.buttonCamera = BABYLON.Xbox360Button.Y;
            this.keyboardCamera = UNITY.UserInputKey.P;
            this.postNetworkAttributes = false;
            this.playerNumber = UNITY.PlayerNumber.One;
            this.boomPosition = new BABYLON.Vector3(0, 0, 0);
            this.airbornVelocity = new BABYLON.Vector3(0, 0, 0);
            this.movementVelocity = new BABYLON.Vector3(0, 0, 0);
            this.targetCameraOffset = new BABYLON.Vector3(0, 0, 0);
            //public getGroundHit():boolean { return this.groundHit; }
            //public getGroundNode():BABYLON.TransformNode { return this.groundNode; }
            //public getGroundPoint():BABYLON.Vector3 { return this.groundPoint; }
            //public getGroundAngle():number { return this.groundAngle; }
            //public getGroundNormal():BABYLON.Vector3 { return this.groundNormal; }
            //public getGroundDistance():number { return this.groundDistance; }
            //public getGroundCollision():boolean { return this.groundCollision; }
            this.rayClimbOffset = 0.35;
            this.rayClimbLength = 0.85;
            this.canClimbObstaclePredicate = null;
            this.rayHeightOffset = 5.0;
            this.rayHeightLength = 6.0;
            this.physicsWorld = null;
            this.abstractMesh = null;
            this.cameraDistance = 0;
            this.forwardCamera = true; // Note Always Camera Forward
            this.avatarRadius = 0.5;
            this.groundingMesh = null;
            this.groundingObject = null;
            this.groundingCallback = null;
            this.dollyDirection = new BABYLON.Vector3(0, 0, 0);
            this.cameraEulers = new BABYLON.Vector3(0, 0, 0);
            this.rotationEulers = new BABYLON.Vector3(0, 0, 0);
            this.cameraPivotOffset = new BABYLON.Vector3(0, 0, 0);
            this.cameraForwardVector = new BABYLON.Vector3(0, 0, 0);
            this.cameraRightVector = new BABYLON.Vector3(0, 0, 0);
            this.desiredForwardVector = new BABYLON.Vector3(0, 0, 0);
            this.desiredRightVector = new BABYLON.Vector3(0, 0, 0);
            this.scaledCamDirection = new BABYLON.Vector3(0, 0, 0);
            this.scaledMaxDirection = new BABYLON.Vector3(0, 0, 0);
            this.parentNodePosition = new BABYLON.Vector3(0, 0, 0);
            this.maximumCameraPos = new BABYLON.Vector3(0, 0, 0);
            this.tempWorldPosition = new BABYLON.Vector3(0, 0, 0);
            this.cameraRaycastShape = null;
            this.defaultRaycastGroup = UNITY.CollisionFilters.DefaultFilter;
            this.defaultRaycastMask = UNITY.CollisionFilters.StaticFilter;
            this.cameraRaycastMask = (UNITY.CollisionFilters.DefaultFilter | UNITY.CollisionFilters.StaticFilter | UNITY.CollisionFilters.KinematicFilter); // Note: Exclude The Player Character Controller From Camera Collision
            this.avatarSkins = null;
            this.cameraNode = null;
            this.cameraPivot = null;
            this.navigationAgent = null;
            this.characterController = null;
            this.verticalVelocity = 0;
            this.movementSpeed = 0;
            this.isRunPressed = false;
            this.isJumpPressed = false;
            this.isCharacterSliding = false;
            this.isCharacterFalling = false;
            this.isCharacterGrounded = false;
            this.isCharacterFallTriggered = false;
            this.isCharacterJumpFrame = false;
            this.isCharacterJumping = false;
            this.isCharacterRising = false;
            this.isCharacterLanding = false;
            this.isCharacterNavigating = false;
            this.navigationAngularSpeed = 0;
            this.updateStateParams = true;
            this.animationStateParams = null;
            this.sphereCollisionShape = null;
            this.hasGroundedContact = false;
            this.showDebugColliders = false;
            this.colliderVisibility = 0;
            this.colliderRenderGroup = 0;
            this.deltaTime = 0;
            this.minJumpTimer = 0;
            this.delayJumpTimer = 0;
            this.canPlayerJump = true;
            this.animationState = null;
            // DEPRECIATED: private rotationVelocityX:BABYLON.Vector2 = new BABYLON.Vector2(0,0);
            // DEPRECIATED: private rotationVelocityY:BABYLON.Vector2 = new BABYLON.Vector2(0,0);
            this.lastJumpVelocity = new BABYLON.Vector3(0, 0, 0);
            this.inputMovementVector = new BABYLON.Vector3(0, 0, 0);
            this.playerLookRotation = new BABYLON.Vector3(0, 0, 0);
            this.playerRotationVector = BABYLON.Vector2.Zero();
            this.playerMovementVelocity = new BABYLON.Vector3(0, 0, 0);
            this.playerRotationQuaternion = BABYLON.Quaternion.Zero();
            this.playerMoveDirection = PROJECT.PlayerMoveDirection.Stationary;
            //private groundHit:boolean = false;
            //private groundNode:BABYLON.TransformNode = null;
            //private groundAngle:number = 0;
            //private groundPoint:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            //private groundNormal:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            //private groundDistance:number = 0;
            //private groundCollision:boolean = false;
            //private groundVelocity:number = 0;
            //private groundSensorLine:UNITY.LinesMeshRenderer = null;
            //private offsetGroundRaycastPosition:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            //private startGroundRaycastPosition:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            //private endGroundRaycastPosition:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            this.forwardDirection = new BABYLON.Vector3(0, 0, 1);
            this.downDirection = new BABYLON.Vector3(0, -1, 0);
            this.climbContact = false;
            this.climbContactNode = null;
            this.climbContactAngle = 0;
            this.climbContactPoint = new BABYLON.Vector3(0, 0, 0);
            this.climbContactNormal = new BABYLON.Vector3(0, 0, 0);
            this.climbContactDistance = 0;
            this.climbSensorLine = null;
            this.offsetClimbRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            this.startClimbRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            this.endClimbRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            this.heightContact = false;
            this.heightContactNode = null;
            this.heightContactAngle = 0;
            this.heightContactPoint = new BABYLON.Vector3(0, 0, 0);
            this.heightContactNormal = new BABYLON.Vector3(0, 0, 0);
            this.heightContactDistance = 0;
            this.heightSensorLine = null;
            this.offsetHeightRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            this.startHeightRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            this.endHeightRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            this.m_velocityOffset = new BABYLON.Vector3(0, 0, 0);
            this.m_actualVelocity = new BABYLON.Vector3(0, 0, 0);
            this.m_linearVelocity = new BABYLON.Vector3(0, 0, 0);
            this.m_lastPosition = new BABYLON.Vector3(0, 0, 0);
            this.m_positionCenter = new BABYLON.Vector3(0, 0, 0);
            this.m_scaledVelocity = 0;
            this.playerDrawVelocity = 0;
            /** Register handler that is triggered before the controller has been updated */
            this.onPreUpdateObservable = new BABYLON.Observable();
            /** Register handler that is triggered before the controller movement has been applied */
            this.onBeforeMoveObservable = new BABYLON.Observable();
            /** Register handler that is triggered after the controller has been updated */
            this.onPostUpdateObservable = new BABYLON.Observable();
            /** Register handler that is triggered after player input has been updated */
            this.onPlayerInputObservable = new BABYLON.Observable();
            /** Register handler that is triggered when player position should be updated */
            this.onPlayerPositionObservable = new BABYLON.Observable();
            /** Register handler that is triggered after performing action has been updated */
            this.onUpdateActionObservable = new BABYLON.Observable();
            /** Register handler that is triggered after animation state has been updated */
            this.onAnimationStateObservable = new BABYLON.Observable();
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Root Motion Animation System
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            this._deltaMotionPosition = new BABYLON.Vector3(0, 0, 0);
            this._deltaMotionRotation = new BABYLON.Quaternion(0, 0, 0, 0);
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Blocking Action Animation System
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            this.isPerformingAction = false;
            this.isRootMotionAction = false;
            this.isActionInterruptable = false;
            this.afterActionHandler = null;
            this.performActionTimer = 0;
            this.performActionNumber = 0;
            this.playerRotationSpeed = 10;
            this.rotatePlayerTowards = false;
            this.matchStartTime = 0;
            this.matchTargetTime = 0;
            this.matchTargetOffset = 0;
            this.matchTargetHeight = false;
            this.lockTargetHeight = false;
            this.lastStartHeight = null;
            this.lastTargetHeight = null;
            this.lastTargetNormal = new BABYLON.Vector3(0, 0, 0);
            this.lastTargetRotation = new BABYLON.Quaternion(0, 0, 0, 1);
            this.lastDeltaPosition = new BABYLON.Vector3(0, 0, 0);
            this.lastDeltaRotation = new BABYLON.Quaternion(0, 0, 0, 1);
            this._ikLeftController = null;
            this._ikLeftFootTarget = null;
            this._ikLeftPoleTarget = null;
            this._ikRightController = null;
            this._ikRightFootTarget = null;
            this._ikRightPoleTarget = null;
            this.abstractSkinMesh = null;
            this.rootBoneTransform = null;
            this.leftFootTransform = null;
            //private leftFootPosition:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            this.leftFootPolePos = new BABYLON.Vector3(0, 0, 0);
            this.leftFootBendAxis = new BABYLON.Vector3(1, 0, 0);
            this.leftFootPoleAngle = 0;
            this.leftFootMaxAngle = 180;
            this.rightFootTransform = null;
            //private rightFootPosition:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            this.rightFootPolePos = new BABYLON.Vector3(0, 0, 0);
            this.rightFootBendAxis = new BABYLON.Vector3(1, 0, 0);
            this.rightFootPoleAngle = 0;
            this.rightFootMaxAngle = 180;
            this.smoothBoomArmLength = null;
            this.smoothBoomArmSpeed = null;
        }
        awake() { this.awakePlayerController(); }
        start() { this.startPlayerController(); }
        after() { this.afterPlayerController(); }
        update() { this.updatePlayerController(); }
        destroy() { this.destroyPlayerController(); }
        getDeltaMotionPosition() {
            this._deltaMotionPosition.set(0, 0, 0);
            if (this.animationState != null) {
                const rootMotionPosition = this.animationState.getDeltaRootMotionPosition();
                if (rootMotionPosition != null) {
                    // FIXME: Calculate Delta Root Motion Position
                    this._deltaMotionPosition.copyFrom(rootMotionPosition);
                }
            }
            return this._deltaMotionPosition;
        }
        getDeltaMotionRotation() {
            this._deltaMotionRotation.set(0, 0, 0, 0);
            if (this.animationState != null) {
                const rootMotionRotation = this.animationState.getDeltaRootMotionRotation();
                if (rootMotionRotation != null) {
                    // FIXME: Calculate Delta Root Motion Rotation
                    this._deltaMotionRotation.copyFrom(rootMotionRotation);
                }
            }
            return this._deltaMotionRotation;
        }
        getIsPerformingAction() { return this.isPerformingAction; }
        getIsRootMotionAction() { return this.isRootMotionAction; }
        getIsActionInterruptable() { return this.isActionInterruptable; }
        playActionAnimation(action, interruptableAction = true, enableRootMotion = false, afterActionComplete = null) {
            if (this.isPerformingAction === false && this.animationState != null && action >= 0) {
                this.isPerformingAction = true;
                this.performActionTimer = 0;
                this.performActionNumber = action;
                this.afterActionHandler = afterActionComplete;
                this.isActionInterruptable = interruptableAction;
                this.isRootMotionAction = enableRootMotion;
                this.playerRotationSpeed = 10;
                this.rotatePlayerTowards = false;
                this.matchStartTime = 0;
                this.matchTargetTime = 0;
                this.matchTargetOffset = 0;
                this.matchTargetHeight = false;
                this.lockTargetHeight = false;
                this.lastStartHeight = null;
                this.lastTargetHeight = null;
                this.lastTargetNormal.set(0, 0, 0);
                this.lastTargetRotation.set(0, 0, 0, 1);
                if (this.isRootMotionAction === true) {
                    this.enableCharacterController(false); // Note: Disable Character Controller
                }
                if (this.animationState != null) {
                    this.animationState.resetSmoothProperty(PROJECT.ThirdPersonPlayerController.PLAYER_HEIGHT);
                }
            }
        }
        resetActionAnimationState() {
            if (this.afterActionHandler != null) {
                try {
                    this.afterActionHandler();
                }
                catch (_a) { }
            }
            if (this.isRootMotionAction === true) {
                this.enableCharacterController(true); // Note: Enable Character Controller
            }
            if (this.animationState != null) {
                this.animationState.resetSmoothProperty(PROJECT.ThirdPersonPlayerController.PLAYER_HEIGHT);
            }
            this.performActionTimer = 0;
            this.performActionNumber = 0;
            this.isPerformingAction = false;
            this.isRootMotionAction = false;
            this.isActionInterruptable = false;
            this.afterActionHandler = null;
            this.playerRotationSpeed = 10;
            this.rotatePlayerTowards = false;
            this.matchStartTime = 0;
            this.matchTargetTime = 0;
            this.matchTargetOffset = 0;
            this.matchTargetHeight = false;
            this.lockTargetHeight = false;
            this.lastStartHeight = null;
            this.lastTargetHeight = null;
            this.lastTargetNormal.set(0, 0, 0);
            this.lastTargetRotation.set(0, 0, 0, 1);
        }
        updateAnimationActionState() {
            const deltaTime = this.getDeltaSeconds();
            const dampTime = (this.matchTargetTime - this.matchStartTime);
            if (this.animationState != null && this.isRootMotionAction === true) {
                const playerGlobalHeight = this.transform.absolutePosition.y;
                this.lastDeltaPosition.copyFrom(this.getDeltaMotionPosition());
                BABYLON.Vector3.TransformNormalToRef(this.lastDeltaPosition, this.transform.getWorldMatrix(), this.lastDeltaPosition);
                if (this.matchTargetHeight === true) {
                    if (this.lastStartHeight == null && this.performActionTimer >= this.matchStartTime) {
                        this.lastStartHeight = playerGlobalHeight;
                        this.animationState.resetSmoothProperty(PROJECT.ThirdPersonPlayerController.PLAYER_HEIGHT);
                        // console.warn(">>> Start Global Height: " + this.lastStartHeight + " --> Perform Action Timer: " + this.performActionTimer);
                    }
                    if (this.lastStartHeight != null && this.lastTargetHeight != null) {
                        this.lastDeltaPosition.y = 0;
                        const fixedTargetHeight = (this.lastTargetHeight + this.matchTargetOffset);
                        if (this.performActionTimer < this.matchTargetTime) {
                            this.animationState.setSmoothFloat(PROJECT.ThirdPersonPlayerController.PLAYER_HEIGHT, fixedTargetHeight, dampTime, deltaTime);
                            const smoothPlayerHeight = this.animationState.getFloat(PROJECT.ThirdPersonPlayerController.PLAYER_HEIGHT);
                            this.lastDeltaPosition.y = (smoothPlayerHeight - playerGlobalHeight);
                            // console.warn(">>> Lerp Target Delta: " + this.lastDeltaPosition.y + " --> Perform Action Timer: " + this.performActionTimer);
                        }
                        else if (this.lockTargetHeight === false && this.performActionTimer >= this.matchTargetTime) {
                            this.lastDeltaPosition.y = (fixedTargetHeight - playerGlobalHeight);
                            this.lockTargetHeight = true;
                            // console.warn(">>> Last Global Delta: " + this.lastDeltaPosition.y + " --> Perform Action Timer: " + this.performActionTimer + " ---> Match Target Time: " + this.matchTargetTime);
                        }
                    }
                }
                // ..
                // Apply Root Motion To Position
                // ..
                // this.lastDeltaPosition.x = 0; // FIXME: Apply Rotation Y Difference Factor From Unity
                // this.lastDeltaPosition.y = 0; // FIXME: Apply Rotation Y Difference Factor From Unity
                this.transform.position.addInPlace(this.lastDeltaPosition);
                // console.log("Player Action Height: " + playerGlobalHeight + " --> Perform Action Timer: " + this.performActionTimer);
                // console.log("Current Delta Height: " + this.lastDeltaPosition.y + " --> Perform Action Timer: " + this.performActionTimer);
                // ..
                // Apply Root Motion To Rotation
                // ..
                if (this.rotatePlayerTowards === true) {
                    if (this.climbContact === true) {
                        this.lastTargetNormal.set(-this.climbContactNormal.x, -this.climbContactNormal.y, -this.climbContactNormal.z);
                        UNITY.Utilities.LookRotationToRef(this.lastTargetNormal, this.lastTargetRotation);
                        const lerpAmount = BABYLON.Scalar.Clamp(this.playerRotationSpeed * deltaTime);
                        BABYLON.Quaternion.SlerpToRef(this.transform.rotationQuaternion, this.lastTargetRotation, lerpAmount, this.transform.rotationQuaternion);
                        //console.log("Climb Target Rotation: " + this.lastTargetRotation);
                    }
                }
                else {
                    this.lastDeltaRotation.copyFrom(this.getDeltaMotionRotation());
                    this.transform.rotationQuaternion.multiplyInPlace(this.lastDeltaRotation);
                }
            }
            this.performActionTimer += deltaTime;
        }
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Controller Attachment Functions
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /** Set the player world position */
        setWorldPosition(x, y, z) {
            if (this.characterController != null) {
                this.characterController.set(x, y, z);
            }
        }
        /** TODO */
        attachPlayerCamera(player) {
            if (this.cameraNode == null) {
                const playerCamera = (player <= 0 || player > 4) ? 1 : player;
                this.cameraNode = PROJECT.DefaultCameraSystem.GetCameraTransform(this.scene, playerCamera);
                if (this.cameraNode != null) {
                    this.cameraNode.parent = this.cameraPivot;
                    this.cameraNode.position.copyFrom(this.boomPosition);
                    this.cameraNode.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                    // ..
                    // const actualCamera:BABYLON.UniversalCamera = SM.FindSceneCameraRig(this.cameraNode) as BABYLON.UniversalCamera;
                    // if (actualCamera != null) actualCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(BABYLON.Tools.ToRadians(30),0,0);
                    // ..
                    // TODO - Move somewhere better - ???
                    // TODO - Handle Long Intitial Camera Pan - ???
                    // ..
                    this.cameraDistance = this.cameraNode.position.length();
                    this.dollyDirection.copyFrom(this.cameraNode.position);
                    this.dollyDirection.normalize();
                }
                else {
                    // DEBUG: UNITY.SceneManager.LogWarning("Failed to locate player camera for: " + this.transform.name);
                }
            }
        }
        getLeftFootTarget() { return this._ikLeftFootTarget; }
        getRightFootTarget() { return this._ikRightFootTarget; }
        getLeftFootController() { return this._ikLeftController; }
        getRightFootController() { return this._ikRightController; }
        attachBoneControllers() {
            const displayHandles = this.getProperty("displayHandles");
            const abstractSkinMeshData = this.getProperty("abstractSkinMesh");
            if (abstractSkinMeshData != null)
                this.abstractSkinMesh = this.getChildNode(abstractSkinMeshData.name, UNITY.SearchType.ExactMatch, false);
            const rootBoneTransformData = this.getProperty("rootBoneTransform");
            if (rootBoneTransformData != null)
                this.rootBoneTransform = this.getChildNode(rootBoneTransformData.name, UNITY.SearchType.ExactMatch, false);
            // ..
            const leftFootTransformData = this.getProperty("leftFootTransform");
            if (leftFootTransformData != null)
                this.leftFootTransform = this.getChildNode(leftFootTransformData.name, UNITY.SearchType.ExactMatch, false);
            //const leftFootPositionData:UNITY.IUnityVector3 = this.getProperty("leftFootPosition");
            //if (leftFootPositionData != null) this.leftFootPosition.copyFrom(UNITY.Utilities.ParseVector3(leftFootPositionData));
            const leftPoleHandleData = this.getProperty("leftFootPolePos");
            if (leftPoleHandleData != null)
                this.leftFootPolePos.copyFrom(UNITY.Utilities.ParseVector3(leftPoleHandleData));
            const leftBendAxisData = this.getProperty("leftFootBendAxis");
            if (leftBendAxisData != null)
                this.leftFootBendAxis.copyFrom(UNITY.Utilities.ParseVector3(leftBendAxisData));
            this.leftFootPoleAngle = this.getProperty("leftFootPoleAngle", this.leftFootPoleAngle);
            this.leftFootMaxAngle = this.getProperty("leftFootMaxAngle", this.leftFootMaxAngle);
            // ..
            const rightFootTransformData = this.getProperty("rightFootTransform");
            if (rightFootTransformData != null)
                this.rightFootTransform = this.getChildNode(rightFootTransformData.name, UNITY.SearchType.ExactMatch, false);
            //const rightFootPositionData:UNITY.IUnityVector3 = this.getProperty("rightFootPosition");
            //if (rightFootPositionData != null) this.rightFootPosition.copyFrom(UNITY.Utilities.ParseVector3(rightFootPositionData));
            const rightPoleHandleData = this.getProperty("rightFootPolePos");
            if (rightPoleHandleData != null)
                this.rightFootPolePos.copyFrom(UNITY.Utilities.ParseVector3(rightPoleHandleData));
            const rightBendAxisData = this.getProperty("rightFootBendAxis");
            if (rightBendAxisData != null)
                this.rightFootBendAxis.copyFrom(UNITY.Utilities.ParseVector3(rightBendAxisData));
            this.rightFootPoleAngle = this.getProperty("rightFootPoleAngle", this.rightFootPoleAngle);
            this.rightFootMaxAngle = this.getProperty("rightFootMaxAngle", this.rightFootMaxAngle);
            // ..
            if (this.abstractSkinMesh != null) {
                let materialName = "M_TARGET_MESH";
                let targetMaterial = this.scene.getMaterialByName(materialName);
                if (targetMaterial == null) {
                    targetMaterial = new BABYLON.StandardMaterial("M_TARGET_MESH", this.scene);
                    targetMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.5, 0.25);
                }
                // ..
                // Setup Left Foot Controller
                // ..
                if (this.leftFootTransform != null && this.leftFootTransform._linkedBone != null) {
                    this._ikLeftFootTarget = BABYLON.MeshBuilder.CreateBox(this.transform.name + ".LeftFootTarget", { width: 0.1, height: 0.1, depth: 0.1 }, this.scene);
                    this._ikLeftFootTarget.parent = this.abstractSkinMesh;
                    //this._ikLeftFootTarget.position.copyFrom(this.leftFootPosition);
                    if (this._ikLeftFootTarget instanceof BABYLON.AbstractMesh) {
                        this._ikLeftFootTarget.material = targetMaterial;
                        this._ikLeftFootTarget.isVisible = displayHandles;
                    }
                    // ..
                    this._ikLeftPoleTarget = BABYLON.MeshBuilder.CreateSphere(this.transform.name + ".LeftFootPole", { diameter: 0.15 }, this.scene);
                    this._ikLeftPoleTarget.parent = this.abstractSkinMesh;
                    this._ikLeftPoleTarget.position.copyFrom(this.leftFootPolePos);
                    if (this._ikLeftPoleTarget instanceof BABYLON.AbstractMesh) {
                        this._ikLeftPoleTarget.isVisible = displayHandles;
                    }
                    // ..
                    // this._ikLeftController = new BABYLON.BoneIKController(this.abstractSkinMesh, (<any>this.leftFootTransform)._linkedBone, {targetMesh:this._ikLeftFootTarget, poleTargetMesh:this._ikLeftPoleTarget, poleAngle:BABYLON.Tools.ToRadians(this.leftFootPoleAngle), bendAxis:this.leftFootBendAxis});
                    // this._ikLeftController.maxAngle = BABYLON.Tools.ToRadians(this.leftFootMaxAngle);
                }
                // ..
                // Setup Right Foot Controller
                // ..
                if (this.rightFootTransform != null && this.rightFootTransform._linkedBone != null) {
                    this._ikRightFootTarget = BABYLON.MeshBuilder.CreateBox(this.transform.name + ".RightFootTarget", { width: 0.1, height: 0.1, depth: 0.1 }, this.scene);
                    this._ikRightFootTarget.parent = this.abstractSkinMesh;
                    //this._ikRightFootTarget.position.copyFrom(this.rightFootPosition);
                    if (this._ikRightFootTarget instanceof BABYLON.AbstractMesh) {
                        this._ikRightFootTarget.material = targetMaterial;
                        this._ikRightFootTarget.isVisible = displayHandles;
                    }
                    // ..
                    this._ikRightPoleTarget = BABYLON.MeshBuilder.CreateSphere(this.transform.name + ".RightFootPole", { diameter: 0.15 }, this.scene);
                    this._ikRightPoleTarget.parent = this.abstractSkinMesh;
                    this._ikRightPoleTarget.position.copyFrom(this.rightFootPolePos);
                    if (this._ikRightPoleTarget instanceof BABYLON.AbstractMesh) {
                        this._ikRightPoleTarget.isVisible = displayHandles;
                    }
                    // ..
                    // this._ikRightController = new BABYLON.BoneIKController(this.abstractSkinMesh, (<any>this.rightFootTransform)._linkedBone, {targetMesh:this._ikRightFootTarget, poleTargetMesh:this._ikRightPoleTarget, poleAngle:BABYLON.Tools.ToRadians(this.rightFootPoleAngle), bendAxis:this.rightFootBendAxis});
                    // this._ikRightController.maxAngle = BABYLON.Tools.ToRadians(this.rightFootMaxAngle);
                }
            }
        }
        attachAnimationController() {
            if (this.animationState == null) {
                this.animationState = this.getComponent("UNITY.AnimationState");
                if (this.animationState == null) {
                    const animationNode = this.getChildWithScript("UNITY.AnimationState");
                    if (animationNode != null) {
                        this.animationState = UNITY.SceneManager.FindScriptComponent(animationNode, "UNITY.AnimationState");
                    }
                    else {
                        // DEBUG: UNITY.SceneManager.LogWarning("Failed to locate animator node for: " + this.transform);
                    }
                }
            }
            if (this.animationState != null) {
                this.animationState.onAnimationEndObservable.add(() => {
                    if (this.isPerformingAction === true) {
                        //console.log("Animation End: " + this.transform.name);
                        this.resetActionAnimationState();
                    }
                });
                this.animationState.onAnimationUpdateObservable.add(() => {
                    if (this.animationState.ikFrameEnabled() === true) {
                        // FIXME: Update target mesh position When Grounded - Use Raycast - ???
                        if (this._ikLeftController != null) {
                            this._ikLeftController.update();
                        }
                        if (this._ikRightController != null) {
                            this._ikRightController.update();
                        }
                    }
                });
            }
        }
        /** TODO */
        enableCharacterController(state) {
            if (state === true) {
                this.movementAllowed = true;
                this.resetPlayerJumpingState();
                if (this.characterController != null) {
                    ////this.characterController.syncGhostToTransformPosition();
                    ////this.characterController.syncMovementState();
                    ////this.characterController.syncTransformToGhostPosition();
                    this.characterController.setGravity(this.gravitationalForce);
                    this.characterController.setFallingSpeed(this.terminalVelocity);
                    this.characterController.setGhostCollisionState(true);
                    this.characterController.updatePosition = true;
                }
            }
            else {
                this.movementAllowed = false;
                this.resetPlayerJumpingState();
                if (this.characterController != null) {
                    this.characterController.setGravity(0);
                    this.characterController.setFallingSpeed(0);
                    this.characterController.setGhostCollisionState(false);
                    ////this.characterController.syncGhostToTransformPosition();
                    this.characterController.updatePosition = false;
                }
            }
        }
        /** TODO */
        resetPlayerRotation() {
            this.transform.rotationQuaternion.toEulerAnglesToRef(this.rotationEulers);
            this.playerRotationVector.x = this.rotationEulers.x;
            this.playerRotationVector.y = this.rotationEulers.y;
        }
        /** TODO */
        resetPlayerJumpingState() {
            this.minJumpTimer = 0;
            this.isCharacterJumping = false;
            this.isCharacterLanding = false;
            this.isCharacterRising = false;
            this.isCharacterJumpFrame = false;
            if (this.characterController != null) {
                this.characterController.jump(0); // Note: Zero Jump Speed
            }
        }
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Controller Worker Functions
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        awakePlayerController() {
            this.gravitationalForce = this.getProperty("gravitationalForce", this.gravitationalForce);
            this.terminalVelocity = this.getProperty("terminalVelocity", this.terminalVelocity);
            this.rotateCamera = this.getProperty("rotateCamera", this.rotateCamera);
            this.mouseWheel = this.getProperty("mouseWheel", this.mouseWheel);
            //this.normalAngle = this.getProperty("normalAngle", this.normalAngle);
            //this.radiusScale = this.getProperty("radiusScale", this.radiusScale);
            //this.rayLength = this.getProperty("rayLength", this.rayLength);
            //this.rayOrigin = this.getProperty("rayOrigin", this.rayOrigin);
            this.detectionRadius = this.getProperty("detectionRadius", this.detectionRadius);
            this.verticalOffset = this.getProperty("verticalOffset", this.verticalOffset);
            this.forwardOffset = this.getProperty("forwardOffset", this.forwardOffset);
            this.rayClimbLength = this.getProperty("rayClimbLength", this.rayClimbLength);
            this.rayClimbOffset = this.getProperty("rayClimbOffset", this.rayClimbOffset);
            this.rayHeightLength = this.getProperty("rayHeightLength", this.rayHeightLength);
            this.rayHeightOffset = this.getProperty("rayHeightOffset", this.rayHeightOffset);
            this.maxAngle = this.getProperty("maxAngle", this.maxAngle);
            this.landingEpsilon = this.getProperty("landingEpsilon", this.landingEpsilon);
            this.minFallVelocity = this.getProperty("minFallVelocity", this.minFallVelocity);
            this.airbornTimeout = this.getProperty("airbornTimeout", this.airbornTimeout);
            this.rootMotion = this.getProperty("rootMotion", this.rootMotion);
            this.moveSpeed = this.getProperty("moveSpeed", this.moveSpeed);
            this.walkSpeed = this.getProperty("walkSpeed", this.walkSpeed);
            this.lookSpeed = this.getProperty("lookSpeed", this.lookSpeed);
            this.jumpSpeed = this.getProperty("jumpSpeed", this.jumpSpeed);
            this.jumpDelay = this.getProperty("jumpDelay", this.jumpDelay);
            this.eyesHeight = this.getProperty("eyesHeight", this.eyesHeight);
            this.pivotHeight = this.getProperty("pivotHeight", this.pivotHeight);
            this.maxDistance = this.getProperty("maxDistance", this.maxDistance);
            this.scrollSpeed = this.getProperty("scrollSpeed", this.scrollSpeed);
            this.topLookLimit = this.getProperty("topLookLimit", this.topLookLimit);
            this.downLookLimit = this.getProperty("downLookLimit", this.downLookLimit);
            this.lowTurnSpeed = this.getProperty("lowTurnSpeed", this.lowTurnSpeed);
            this.highTurnSpeed = this.getProperty("highTurnSpeed", this.highTurnSpeed);
            // DEPRECIATED: this.smoothingSpeed = this.getProperty("smoothingSpeed", this.smoothingSpeed);
            this.enableInput = this.getProperty("enableInput", this.enableInput);
            this.playerNumber = this.getProperty("playerNumber", this.playerNumber);
            this.attachCamera = this.getProperty("attachCamera", this.attachCamera);
            this.freeLooking = this.getProperty("freeLooking", this.freeLooking);
            this.runKeyRequired = this.getProperty("runKeyRequired", this.runKeyRequired);
            this.cameraCollisions = this.getProperty("cameraCollisions", this.cameraCollisions);
            this.cameraSmoothing = this.getProperty("cameraSmoothing", this.cameraSmoothing);
            this.distanceFactor = this.getProperty("distanceFactor", this.distanceFactor);
            this.minimumDistance = this.getProperty("minimumDistance", this.minimumDistance);
            this.smoothMotionTime = this.getProperty("smoothMotionTime", this.smoothMotionTime);
            this.smoothInputVectors = this.getProperty("smoothInputVectors", this.smoothInputVectors);
            this.smoothAcceleration = this.getProperty("smoothAcceleration", this.smoothAcceleration);
            this.accelerationSpeed = this.getProperty("accelerationSpeed", this.accelerationSpeed);
            this.decelerationSpeed = this.getProperty("decelerationSpeed", this.decelerationSpeed);
            this.climbVolumeTag = this.getProperty("climbVolumeTag", this.climbVolumeTag);
            this.vaultVolumeTag = this.getProperty("vaultVolumeTag", this.vaultVolumeTag);
            this.useClimbSystem = this.getProperty("useClimbSystem", this.useClimbSystem);
            this.maxHeightRanges = this.getProperty("maxHeightRanges", this.maxHeightRanges);
            this.ignoreTriggerTags = this.getProperty("ignoreTriggerTags", this.ignoreTriggerTags);
            this.updateStateParams = this.getProperty("updateStateParams", this.updateStateParams);
            this.animationStateParams = this.getProperty("animationStateParams", this.animationStateParams);
            this.postNetworkAttributes = this.getProperty("postNetworkAttributes", this.postNetworkAttributes);
            // ..
            const arrowKeyRotation = this.getProperty("arrowKeyRotation");
            if (arrowKeyRotation === true)
                UNITY.UserInputOptions.UseArrowKeyRotation = true;
            // ..
            const boomPositionData = this.getProperty("boomPosition");
            if (boomPositionData != null)
                this.boomPosition = UNITY.Utilities.ParseVector3(boomPositionData);
            // ..
            const sphereRadius = this.getProperty("sphereRadius", 0.5);
            //this.cameraRaycastShape = UNITY.RigidbodyPhysics.CreatePhysicsSphereShape(sphereRadius);
            // ..
            this.abstractMesh = this.getAbstractMesh();
            this.showDebugColliders = UNITY.Utilities.ShowDebugColliders();
            this.colliderVisibility = UNITY.Utilities.ColliderVisibility();
            this.colliderRenderGroup = UNITY.Utilities.ColliderRenderGroup();
            this.resetPlayerRotation();
            // ..
            /*
            this.physicsWorld = UNITY.RigidbodyPhysics.GetPhysicsWorld(this.scene);
            this.groundingMesh = BABYLON.MeshBuilder.CreateSphere("GroundingMesh", { segments: 24, diameter: (this.detectionRadius * 2), }, this.scene);
            this.groundingMesh.setParent(this.transform);
            this.groundingMesh.position.set(0, (this.verticalOffset * 2), (this.forwardOffset * 2));
            this.groundingMesh.rotationQuaternion = new BABYLON.Quaternion(0,0,0,1);
            this.groundingMesh.material = UNITY.Utilities.GetColliderMaterial(this.scene);
            this.groundingMesh.isVisible = this.showDebugColliders;
            this.groundingMesh.visibility = this.colliderVisibility;
            this.groundingMesh.renderingGroupId = this.colliderRenderGroup;
            UNITY.RigidbodyPhysics.CreatePhysicsImpostor(this.scene, this.groundingMesh, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 0 });
            this.groundingMesh.physicsImpostor.executeNativeFunction((word:any, body:any) => {
                this.groundingObject = Ammo.castObject(body, Ammo.btCollisionObject);
                this.groundingCallback = new Ammo.ConcreteContactResultCallback();
                this.groundingCallback.m_collisionFilterGroup = UNITY.CollisionFilters.KinematicFilter;
                this.groundingCallback.m_collisionFilterMask = UNITY.CollisionFilters.DefaultFilter | UNITY.CollisionFilters.StaticFilter;
                this.groundingCallback.addSingleResult = (cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1) => {
                    // KEEP FOR REFERENCE
                    // const contactPoint = Ammo.wrapPointer(cp, Ammo.btManifoldPoint);
                    // const colObj0Wrapper:any = Ammo.wrapPointer(colObj0Wrap, Ammo.btCollisionObjectWrapper);
                    // const colobj0:any = colObj0Wrapper.getCollisionObject();
                    // const entity0:BABYLON.TransformNode = (colobj0 != null && colobj0.entity != null) ? colobj0.entity : null;
                    // let contactEntity:BABYLON.TransformNode = null;
                    // if (colObj1Wrap != null) {
                    //    const colObj1Wrapper:any = Ammo.wrapPointer(colObj1Wrap, Ammo.btCollisionObjectWrapper);
                    //    if (colObj1Wrapper != null) {
                    //        const colobj1:any = colObj1Wrapper.getCollisionObject();
                    //        contactEntity = (colobj1 != null && colobj1.entity != null) ? colobj1.entity : null;
                    //    }
                    // }
                    // if (contactEntity != null) {
                    //    this.hasGroundedContact = true;
                    //    // console.log("Ground Contact Mesh: " + contactEntity.name);
                    // }
                    this.hasGroundedContact = true;
                };
                if (body.activate) body.activate();
                // ..
                // Set Collision Flags
                // ..
                if (body.setCollisionFlags && body.getCollisionFlags) {
                    body.setCollisionFlags(body.getCollisionFlags() | BABYLON.CollisionFlags.CF_NO_CONTACT_RESPONSE);       // TRIGGER_OBJECT
                    body.setCollisionFlags(body.getCollisionFlags() | BABYLON.CollisionFlags.CF_KINEMATIC_OBJECT);          // STATIC_OBJECT
                    body.setCollisionFlags(body.getCollisionFlags() | BABYLON.CollisionFlags.CF_CUSTOM_MATERIAL_CALLBACK);  // CUSTOM_MATERIAL
                }
                // ..
                // Set Collision Masks
                // ..
                if (body.getBroadphaseProxy) {
                    body.getBroadphaseProxy().set_m_collisionFilterGroup(UNITY.CollisionFilters.KinematicFilter)
                    body.getBroadphaseProxy().set_m_collisionFilterMask(UNITY.CollisionFilters.DefaultFilter | UNITY.CollisionFilters.StaticFilter)
                }
            });
            */
            // ..
            this.cameraPivot = new BABYLON.Mesh(this.transform.name + ".CameraPivot", this.scene);
            this.cameraPivot.parent = null;
            this.cameraPivot.position = this.transform.position.clone();
            this.cameraPivot.rotationQuaternion = this.transform.rotationQuaternion.clone();
            this.cameraPivot.checkCollisions = false;
            this.cameraPivot.isPickable = false;
            // ..
            if (this.showDebugColliders === true) {
                const testPivot = BABYLON.MeshBuilder.CreateBox("TestPivot", { width: 0.25, height: 0.25, depth: 0.5 }, this.scene);
                testPivot.parent = this.cameraPivot;
                testPivot.position.set(0, 0, 0);
                testPivot.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                testPivot.visibility = 0.5;
                testPivot.renderingGroupId = this.colliderRenderGroup;
                testPivot.checkCollisions = false;
                testPivot.isPickable = false;
            }
            // ..
            const cylinderShape = this.getProperty("cylinderShape");
            const configController = this.getComponent("UNITY.CharacterController");
            if (configController != null && cylinderShape === true)
                configController.preCreateCylinderShape();
            // ..
            // Setup IK Bone Controllers
            // ..
            this.attachBoneControllers();
        }
        startPlayerController() {
            // TODO - Support Dynamic PlayerNumber Change - ???
            if (this.attachCamera === true) {
                this.attachPlayerCamera(this.playerNumber);
            }
            this.navigationAgent = this.getComponent("UNITY.NavigationAgent");
            this.characterController = this.getComponent("UNITY.CharacterController");
            if (this.characterController != null) {
                this.avatarRadius = this.characterController.getAvatarRadius();
                this.characterController.setGravity(this.gravitationalForce);
                this.characterController.setFallingSpeed(this.terminalVelocity);
                //this.characterController.onUpdatePositionObservable.add(() => {
                //    this.updatePlayerPosition();
                //    this.updateCameraController();
                //});
                UNITY.SceneManager.LogWarning("Starting player controller in physic engine mode for: " + this.transform.name);
            }
            else {
                UNITY.SceneManager.LogWarning("No character controller found for: " + this.transform.name);
            }
            // Set player window state variable
            // SM.SetWindowState("player", this);
        }
        updatePlayerPosition() {
            if (this.onPlayerPositionObservable && this.onPlayerPositionObservable.hasObservers()) {
                this.onPlayerPositionObservable.notifyObservers(this.transform);
            }
        }
        updatePlayerController() {
            this.deltaTime = this.getDeltaSeconds();
            //this.smoothDeltaTime = UNITY.System.SmoothDeltaFactor * this.deltaTime + (1 - UNITY.System.SmoothDeltaFactor) * this.smoothDeltaTime;
            // ..
            this.m_actualVelocity = this.transform.absolutePosition.subtract(this.m_lastPosition);
            this.m_linearVelocity.copyFrom(this.m_actualVelocity);
            this.m_scaledVelocity = (this.m_linearVelocity.length() / this.deltaTime);
            this.m_linearVelocity.normalize();
            this.m_linearVelocity.scaleInPlace(this.m_scaledVelocity);
            if (this.playerDrawVelocity > 0) {
                this.m_velocityOffset.copyFrom(this.m_linearVelocity);
                this.m_velocityOffset.scaleInPlace(this.playerDrawVelocity);
            }
            else {
                this.m_velocityOffset.set(0, 0, 0);
            }
            this.m_lastPosition.copyFrom(this.transform.absolutePosition);
            // TODO - FIX THIS SHIT
            if (this.updateStateParams === true && this.animationState == null) {
                this.attachAnimationController();
            }
            // ..
            if (this.minJumpTimer > 0) {
                this.minJumpTimer -= this.deltaTime;
                if (this.minJumpTimer < 0)
                    this.minJumpTimer = 0;
            }
            if (this.isCharacterGrounded === true && this.delayJumpTimer > 0) {
                this.delayJumpTimer -= this.deltaTime;
                if (this.delayJumpTimer < 0)
                    this.delayJumpTimer = 0;
            }
            // ..
            this.canPlayerJump = true;
            if (this.isPerformingAction === true) {
                this.updateAnimationActionState();
                if (this.onUpdateActionObservable && this.onUpdateActionObservable.hasObservers()) {
                    this.onUpdateActionObservable.notifyObservers(this.transform);
                }
            }
            if (this.enableInput === false)
                return;
            const userInputX = UNITY.InputController.GetUserInput(UNITY.UserInputAxis.Horizontal, this.playerNumber);
            const userInputZ = UNITY.InputController.GetUserInput(UNITY.UserInputAxis.Vertical, this.playerNumber);
            const userMouseX = UNITY.InputController.GetUserInput(UNITY.UserInputAxis.MouseX, this.playerNumber);
            const userMouseY = UNITY.InputController.GetUserInput(UNITY.UserInputAxis.MouseY, this.playerNumber);
            if (this.smoothAcceleration === true) {
                // SMOOTH USER INPUT X
                if (userInputX > 0) {
                    this.playerInputX += (this.accelerationSpeed * this.deltaTime);
                    if (this.playerInputX > 1)
                        this.playerInputX = 1;
                }
                else if (userInputX < 0) {
                    this.playerInputX -= (this.accelerationSpeed * this.deltaTime);
                    if (this.playerInputX < -1)
                        this.playerInputX = -1;
                }
                else {
                    if (this.playerInputX < 0) {
                        this.playerInputX += (this.decelerationSpeed * this.deltaTime);
                        if (this.playerInputX > 0)
                            this.playerInputX = 0;
                    }
                    else if (this.playerInputX > 0) {
                        this.playerInputX -= (this.decelerationSpeed * this.deltaTime);
                        if (this.playerInputX < 0)
                            this.playerInputX = 0;
                    }
                }
                // SMOOTH USER INPUT Z
                if (userInputZ > 0) {
                    this.playerInputZ += (this.accelerationSpeed * this.deltaTime);
                    if (this.playerInputZ > 1)
                        this.playerInputZ = 1;
                }
                else if (userInputZ < 0) {
                    this.playerInputZ -= (this.accelerationSpeed * this.deltaTime);
                    if (this.playerInputZ < -1)
                        this.playerInputZ = -1;
                }
                else {
                    if (this.playerInputZ < 0) {
                        this.playerInputZ += (this.decelerationSpeed * this.deltaTime);
                        if (this.playerInputZ > 0)
                            this.playerInputZ = 0;
                    }
                    else if (this.playerInputZ > 0) {
                        this.playerInputZ -= (this.decelerationSpeed * this.deltaTime);
                        if (this.playerInputZ < 0)
                            this.playerInputZ = 0;
                    }
                }
            }
            else {
                // RAW USER INPUT XZ
                this.playerInputX = userInputX;
                this.playerInputZ = userInputZ;
            }
            // ..
            this.playerMouseX = userMouseX;
            this.playerMouseY = userMouseY;
            // ..
            // Validate Animation Action
            // ..
            if (this.isPerformingAction === true && this.isActionInterruptable === true) {
                if (this.playerInputX !== 0 || this.playerInputZ !== 0) {
                    //console.log("Animation Interrupt: " + this.transform.name);
                    this.resetActionAnimationState();
                }
            }
            if (this.isPerformingAction === true) {
                this.canPlayerJump = false;
                this.playerInputX = 0;
                this.playerInputZ = 0;
            }
            // ..
            // Update Player Input
            // ..
            if (this.onPlayerInputObservable && this.onPlayerInputObservable.hasObservers()) {
                this.onPlayerInputObservable.notifyObservers(this.transform);
            }
            //..
            // Update Input Magnitude
            // ..
            this.inputMovementVector.set(this.playerInputX, 0, this.playerInputZ);
            if (this.inputMovementVector.length() > 1.0)
                this.inputMovementVector.normalize(); // Note: Normalize In Place
            this.inputMagnitude = this.inputMovementVector.length();
            // ..
            // Update Move Direction
            // ..
            const moveForward = (this.playerInputZ > 0);
            const moveBackward = (this.playerInputZ < 0);
            const moveRight = (this.playerInputX > 0);
            const moveLeft = (this.playerInputX < 0);
            if (moveForward === true) {
                if (moveLeft === true) {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.ForwardLeft;
                }
                else if (moveRight === true) {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.ForwardRight;
                }
                else {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.Forward;
                }
            }
            else if (moveBackward === true) {
                if (moveLeft === true) {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.BackwardLeft;
                }
                else if (moveRight === true) {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.BackwardRight;
                }
                else {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.Backward;
                }
            }
            else if (moveLeft === true) {
                this.playerMoveDirection = PROJECT.PlayerMoveDirection.StrafingLeft;
            }
            else if (moveRight === true) {
                this.playerMoveDirection = PROJECT.PlayerMoveDirection.StrafingRight;
            }
            else {
                this.playerMoveDirection = PROJECT.PlayerMoveDirection.Stationary;
            }
            // ..
            // Update Pre Notifications
            // ..
            if (this.onPreUpdateObservable && this.onPreUpdateObservable.hasObservers()) {
                this.onPreUpdateObservable.notifyObservers(this.transform);
            }
            // ..
            // Update Forward Camera Vector
            // ..
            this.cameraForwardVector.copyFrom(this.cameraPivot.forward);
            this.cameraForwardVector.y = 0;
            this.cameraForwardVector.normalize();
            this.cameraForwardVector.scaleToRef(this.playerInputZ, this.desiredForwardVector);
            // ..
            // Update Right Camera Vector
            // ..
            this.cameraRightVector.copyFrom(this.cameraPivot.right);
            this.cameraRightVector.y = 0;
            this.cameraRightVector.normalize();
            this.cameraRightVector.scaleToRef(this.playerInputX, this.desiredRightVector);
            // ..
            // Update Player Rotation Vector
            // ..
            this.playerRotationVector.y += (this.playerMouseX * this.lookSpeed * this.deltaTime);
            this.playerRotationVector.x += (-this.playerMouseY * this.lookSpeed * this.deltaTime);
            this.playerRotationVector.x = BABYLON.Scalar.Clamp(this.playerRotationVector.x, -BABYLON.Tools.ToRadians(this.downLookLimit), BABYLON.Tools.ToRadians(this.topLookLimit));
            if (this.movementAllowed === false) {
                this.canPlayerJump = false;
                this.playerInputX = 0;
                this.playerInputZ = 0;
            }
            // ..
            // Smooth Player Rotation Vector (DEPRECIATED)
            // ..
            // let newPlayerRotationVectorY = this.playerRotationVector.y + (this.playerMouseX * this.lookSpeed * this.deltaTime);
            // let newPlayerRotationVectorX = this.playerRotationVector.x + (-this.playerMouseY * this.lookSpeed * this.deltaTime);
            // newPlayerRotationVectorX = BABYLON.Scalar.Clamp(newPlayerRotationVectorX, -BABYLON.Tools.ToRadians(this.downLookLimit), BABYLON.Tools.ToRadians(this.topLookLimit));
            // this.playerRotationVector.x = UNITY.Utilities.SmoothDampAngle(this.playerRotationVector.x, newPlayerRotationVectorX, this.smoothingSpeed, Number.MAX_VALUE, this.deltaTime, this.rotationVelocityX);
            // this.playerRotationVector.y = UNITY.Utilities.SmoothDampAngle(this.playerRotationVector.y, newPlayerRotationVectorY, this.smoothingSpeed, Number.MAX_VALUE, this.deltaTime, this.rotationVelocityY);
            // ..
            // Update Player Button Presses
            // ..
            this.isRunPressed = (UNITY.InputController.GetKeyboardInput(this.keyboardRun) || UNITY.InputController.GetGamepadButtonInput(this.buttonRun));
            this.isJumpPressed = (UNITY.InputController.GetKeyboardInput(this.keyboardJump) || UNITY.InputController.GetGamepadButtonInput(this.buttonJump));
            // ..
            // Update Player Movement Velocity
            // ..
            this.movementSpeed = (this.inputMagnitude * this.moveSpeed * this.speedFactor);
            if (this.runKeyRequired === true && this.isRunPressed === false) {
                // ..
                // TODO: Lerp Max Speed From Walk To Run And Vice Versa (Smooth Out Transitions)
                // ..
                this.movementSpeed = BABYLON.Scalar.Clamp(this.movementSpeed, 0, this.walkSpeed);
            }
            // ..
            // Forward Third Person View - Player Look Rotation
            // ..
            this.desiredForwardVector.addToRef(this.desiredRightVector, this.playerLookRotation);
            this.transform.forward.scaleToRef(this.movementSpeed, this.playerMovementVelocity);
            // Always Free Looking - Lerp Player Rotation (Turn And Burn)
            if (this.movementAllowed == true) {
                if (this.inputMagnitude > 0) {
                    const forwardTurnRatio = (this.playerMovementVelocity.length() / this.moveSpeed);
                    const forwardTurnSpeed = BABYLON.Scalar.Lerp(this.highTurnSpeed, this.lowTurnSpeed, forwardTurnRatio);
                    UNITY.Utilities.LookRotationToRef(this.playerLookRotation, this.playerRotationQuaternion);
                    // TODO: Handle Root Motion Rotation
                    BABYLON.Quaternion.SlerpToRef(this.transform.rotationQuaternion, this.playerRotationQuaternion, (forwardTurnSpeed * this.deltaTime), this.transform.rotationQuaternion);
                }
            }
            this.verticalVelocity = this.getVerticalVelocity();
            this.movementVelocity.copyFrom(this.playerMovementVelocity);
            // ..
            // Update Character Controller
            // ..
            this.hasGroundedContact = false;
            this.isCharacterGrounded = false;
            this.isCharacterSliding = false;
            this.isCharacterFalling = false;
            this.isCharacterJumpFrame = false;
            this.isCharacterNavigating = (this.navigationAgent != null && this.navigationAgent.isNavigating());
            this.navigationAngularSpeed = (this.navigationAgent != null) ? this.navigationAgent.angularSpeed : 0;
            this.updateCharacterController();
            // ..
            // Update Animation State Params
            // ..
            if (this.animationState != null && this.updateStateParams === true) {
                this.validateAnimationStateParams();
                this.animationState.setInteger(this.animationStateParams.moveDirection, this.playerMoveDirection);
                this.animationState.setFloat(this.animationStateParams.heightInput, this.verticalVelocity);
                this.animationState.setBool(this.animationStateParams.jumpFrame, this.isCharacterJumpFrame);
                this.animationState.setBool(this.animationStateParams.jumpState, this.isCharacterJumping);
                this.animationState.setInteger(this.animationStateParams.actionState, this.performActionNumber);
                this.animationState.setBool(this.animationStateParams.fallingState, this.isCharacterFalling);
                this.animationState.setBool(this.animationStateParams.slidingState, this.isCharacterSliding);
                this.animationState.setBool(this.animationStateParams.groundedState, this.isCharacterGrounded);
                if (this.smoothMotionTime > 0) {
                    if (this.smoothInputVectors === true) {
                        this.animationState.setSmoothFloat(this.animationStateParams.horizontalInput, this.playerInputX, this.smoothMotionTime, this.deltaTime);
                        this.animationState.setSmoothFloat(this.animationStateParams.verticalInput, this.playerInputZ, this.smoothMotionTime, this.deltaTime);
                        this.animationState.setSmoothFloat(this.animationStateParams.mouseXInput, this.playerMouseX, this.smoothMotionTime, this.deltaTime);
                        this.animationState.setSmoothFloat(this.animationStateParams.mouseYInput, this.playerMouseY, this.smoothMotionTime, this.deltaTime);
                    }
                    else {
                        this.animationState.setFloat(this.animationStateParams.horizontalInput, this.playerInputX);
                        this.animationState.setFloat(this.animationStateParams.verticalInput, this.playerInputZ);
                        this.animationState.setFloat(this.animationStateParams.mouseXInput, this.playerMouseX);
                        this.animationState.setFloat(this.animationStateParams.mouseYInput, this.playerMouseY);
                    }
                    this.animationState.setSmoothFloat(this.animationStateParams.inputMagnitude, this.inputMagnitude, this.smoothMotionTime, this.deltaTime);
                    this.animationState.setSmoothFloat(this.animationStateParams.speedInput, this.movementSpeed, this.smoothMotionTime, this.deltaTime);
                }
                else {
                    this.animationState.setFloat(this.animationStateParams.horizontalInput, this.playerInputX);
                    this.animationState.setFloat(this.animationStateParams.verticalInput, this.playerInputZ);
                    this.animationState.setFloat(this.animationStateParams.mouseXInput, this.playerMouseX);
                    this.animationState.setFloat(this.animationStateParams.mouseYInput, this.playerMouseY);
                    this.animationState.setFloat(this.animationStateParams.inputMagnitude, this.inputMagnitude);
                    this.animationState.setFloat(this.animationStateParams.speedInput, this.movementSpeed);
                }
                if (this.isCharacterNavigating === true) {
                    // TODO - Update Speed Input With Navigation Magnitude
                    // this.animationState.setFloat(this.animationStateParams.speedInput, this.inputMagnitude);
                }
                if (this.onAnimationStateObservable && this.onAnimationStateObservable.hasObservers()) {
                    this.onAnimationStateObservable.notifyObservers(this.transform);
                }
            }
            // ..
            // Post Network Attributes
            // ..
            if (this.postNetworkAttributes == true && UNITY.EntityController.HasNetworkEntity(this.transform)) {
                UNITY.EntityController.PostBufferedAttribute(this.transform, 0, this.playerMoveDirection); // Direction
                UNITY.EntityController.PostBufferedAttribute(this.transform, 1, this.inputMagnitude); // Magnitude
                UNITY.EntityController.PostBufferedAttribute(this.transform, 2, this.playerInputX); // Horizonal
                UNITY.EntityController.PostBufferedAttribute(this.transform, 3, this.playerInputZ); // Vertical
                UNITY.EntityController.PostBufferedAttribute(this.transform, 4, this.playerMouseX); // MouseX
                UNITY.EntityController.PostBufferedAttribute(this.transform, 5, this.playerMouseY); // MouseY
                UNITY.EntityController.PostBufferedAttribute(this.transform, 6, this.verticalVelocity); // Vertical Velocity
                UNITY.EntityController.PostBufferedAttribute(this.transform, 7, this.movementSpeed); // Movement Speed
                UNITY.EntityController.PostBufferedAttribute(this.transform, 8, this.performActionNumber); // Action State
                UNITY.EntityController.PostBufferedAttribute(this.transform, 9, ((this.isCharacterJumpFrame) ? 1 : 0)); // Jump Frame
                UNITY.EntityController.PostBufferedAttribute(this.transform, 10, ((this.isCharacterJumping) ? 1 : 0)); // Is Jumping
                UNITY.EntityController.PostBufferedAttribute(this.transform, 11, ((this.isCharacterFalling) ? 1 : 0)); // Is Falling
                UNITY.EntityController.PostBufferedAttribute(this.transform, 12, ((this.isCharacterSliding) ? 1 : 0)); // Is Sliding
                UNITY.EntityController.PostBufferedAttribute(this.transform, 13, ((this.isCharacterGrounded) ? 1 : 0)); // Is Grounded
            }
            // ..
            // Update Post Notifications
            // ..
            if (this.onPostUpdateObservable && this.onPostUpdateObservable.hasObservers()) {
                this.onPostUpdateObservable.notifyObservers(this.transform);
            }
        }
        afterPlayerController() {
        }
        // FIXME: Extra Raycast Distance When On Various Slope Angles - ???
        updateCharacterController() {
            if (this.characterController != null) {
                if (this.groundingMesh != null) {
                    this.groundingMesh.position.set(0, (this.verticalOffset * 2), (this.forwardOffset * 2));
                }
                if (this.physicsWorld != null && this.physicsWorld.contactTest != null && this.groundingObject != null && this.groundingCallback != null) {
                    this.physicsWorld.contactTest(this.groundingObject, this.groundingCallback);
                }
                this.isCharacterRising = (this.isCharacterJumping == true && this.verticalVelocity > 0);
                this.isCharacterLanding = (this.isCharacterJumping == true && this.verticalVelocity < 0);
                if (this.isCharacterRising == true) {
                    this.hasGroundedContact = false; // IGNORE CONTACT
                }
                if (this.hasGroundedContact === true && this.minJumpTimer <= 0) {
                    this.isCharacterSliding = false; // NOT SLIDING
                    this.isCharacterGrounded = true; // IS GROUNDED
                }
                //this.castPhysicsGroundCheckRay();
                //const slopeAngleLength:number = 0; // TODO: Account For Current Slope Angle - ???
                //const minGroundDistanceLength:number = (PROJECT.StandardPlayerController.MIN_GROUND_DISTANCE + slopeAngleLength);
                //this.groundCollision = (this.groundHit === true && this.groundDistance <= minGroundDistanceLength && (this.normalAngle <= 0 || this.groundNormal.y >= this.normalAngle));
                //if (this.groundCollision === true && this.minJumpTimer <= 0) {
                //    if (this.verticalVelocity === 0 || (this.groundAngle > 0 && this.verticalVelocity > 0)) {
                //        this.isCharacterSliding = false;    // NOT SLIDING
                //        this.isCharacterGrounded = true;    // IS GROUNDED
                //    } else if (this.groundAngle > 0 && this.verticalVelocity < 0) {
                //        this.isCharacterSliding = true;     // IS SLIDING
                //        this.isCharacterGrounded = false;   // NOT GROUNDED
                //    }
                //}
                if (this.isCharacterGrounded === true)
                    this.isCharacterJumping = false;
                this.isCharacterFalling = (this.isCharacterGrounded === false && this.isCharacterSliding == false && this.isCharacterJumping == false && this.verticalVelocity < 0 && Math.abs(this.verticalVelocity) >= this.minFallVelocity);
                if (this.isCharacterFalling === true && this.isCharacterFallTriggered === false) {
                    this.isCharacterFallTriggered = true;
                    if (this.jumpDelay > 0)
                        this.delayJumpTimer = this.jumpDelay; // DUNNO: MAYBE USE SEPERATE FALLING DELAY TIMER - ???
                }
                if (this.isCharacterGrounded === true)
                    this.isCharacterFallTriggered = false;
                // var msgx = ("Grounded: " + this.isCharacterGrounded + " -> Jumping: " + this.isCharacterJumping + " -> Rising: " + this.isCharacterRising + " -> Landing: " + this.isCharacterLanding + " -> Velocity: " + this.verticalVelocity);
                // console.log(msgx);
                // WM.PrintToScreen(msgx);
                // ..
                // Update Climbing System
                // ..
                if (this.useClimbSystem === true) {
                    this.castPhysicsClimbingVolumeRay();
                    this.castPhysicsHeightCheckVolumeRay();
                }
                // ..
                // Process Character Movement
                // ..
                //if (this.movementAllowed === false) return;
                if (this.isCharacterNavigating === false && this.movementAllowed === true) {
                    if (this.isCharacterGrounded === true) {
                        if (this.delayJumpTimer <= 0)
                            this.isCharacterJumpFrame = (this.canPlayerJump === true && this.isJumpPressed === true);
                        if (this.isPerformingAction === false && this.isCharacterJumpFrame === true && this.useClimbSystem === true && this.climbContact === true && this.heightContact === true) {
                            let climbAction = -1;
                            let rotateSpeed = 1;
                            let rotateTowards = false;
                            let matchHeight = false;
                            let startTime = 0;
                            let targetTime = 0;
                            let targetOffset = 0;
                            const hitHeight = parseFloat(this.heightContactPoint.y.toFixed(2));
                            const playerHeight = parseFloat(this.transform.position.y.toFixed(2));
                            const obstacleHeight = parseFloat((hitHeight - playerHeight).toFixed(2));
                            //console.log("Climb Action -->  Hit Height: " + hitHeight + " --> Player Height: " + playerHeight + " --> Obstacle Height: " + obstacleHeight + " --> Rotate Towards: " + rotateTowards);
                            if (obstacleHeight >= this.maxHeightRanges.stepUpRange.minimumHeight && obstacleHeight <= this.maxHeightRanges.stepUpRange.maximumHeight) {
                                climbAction = PROJECT.ActionAnimationType.StepUp;
                                rotateSpeed = this.maxHeightRanges.stepUpRange.rotationSpeed;
                                rotateTowards = this.maxHeightRanges.stepUpRange.rotateTowards;
                                matchHeight = this.maxHeightRanges.stepUpRange.matchHeight;
                                startTime = this.maxHeightRanges.stepUpRange.startTime;
                                targetTime = this.maxHeightRanges.stepUpRange.targetTime;
                                targetOffset = this.maxHeightRanges.stepUpRange.targetOffset;
                            }
                            else if (obstacleHeight >= this.maxHeightRanges.jumpUpRange.minimumHeight && obstacleHeight <= this.maxHeightRanges.jumpUpRange.maximumHeight) {
                                climbAction = PROJECT.ActionAnimationType.JumpUp;
                                rotateSpeed = this.maxHeightRanges.jumpUpRange.rotationSpeed;
                                rotateTowards = this.maxHeightRanges.jumpUpRange.rotateTowards;
                                matchHeight = this.maxHeightRanges.jumpUpRange.matchHeight;
                                startTime = this.maxHeightRanges.jumpUpRange.startTime;
                                targetTime = this.maxHeightRanges.jumpUpRange.targetTime;
                                targetOffset = this.maxHeightRanges.jumpUpRange.targetOffset;
                            }
                            else if (obstacleHeight >= this.maxHeightRanges.climbUpRange.minimumHeight && obstacleHeight <= this.maxHeightRanges.climbUpRange.maximumHeight) {
                                climbAction = PROJECT.ActionAnimationType.ClimbUp;
                                rotateSpeed = this.maxHeightRanges.climbUpRange.rotationSpeed;
                                rotateTowards = this.maxHeightRanges.climbUpRange.rotateTowards;
                                matchHeight = this.maxHeightRanges.climbUpRange.matchHeight;
                                startTime = this.maxHeightRanges.climbUpRange.startTime;
                                targetTime = this.maxHeightRanges.climbUpRange.targetTime;
                                targetOffset = this.maxHeightRanges.climbUpRange.targetOffset;
                            }
                            if (climbAction >= 0) {
                                if (this.canClimbObstaclePredicate == null || this.canClimbObstaclePredicate(climbAction) === true) {
                                    this.isCharacterJumpFrame = false;
                                    this.isCharacterJumping = false;
                                    this.isCharacterLanding = false;
                                    this.isCharacterRising = false;
                                    this.playActionAnimation(climbAction, false, true);
                                    this.playerRotationSpeed = rotateSpeed;
                                    this.rotatePlayerTowards = rotateTowards;
                                    this.matchTargetHeight = matchHeight;
                                    this.matchStartTime = (startTime - PROJECT.ThirdPersonPlayerController.MIN_TIMER_OFFSET);
                                    this.matchTargetTime = (targetTime - PROJECT.ThirdPersonPlayerController.MIN_TIMER_OFFSET);
                                    this.matchTargetOffset = targetOffset;
                                    this.lastTargetHeight = hitHeight;
                                    this.lastStartHeight = null;
                                    this.lockTargetHeight = false;
                                }
                            }
                        }
                        if (this.isCharacterJumpFrame === true && this.jumpSpeed > 0) {
                            this.isCharacterJumping = true;
                            this.characterController.jump(this.jumpSpeed);
                            if (this.jumpDelay > 0)
                                this.delayJumpTimer = this.jumpDelay;
                            if (this.airbornTimeout > 0)
                                this.minJumpTimer = (this.airbornTimeout + this.deltaTime);
                            this.lastJumpVelocity.set(this.movementVelocity.x, 0, this.movementVelocity.z);
                        }
                        // ..
                        // Update Move Notifications
                        // ..
                        if (this.onBeforeMoveObservable && this.onBeforeMoveObservable.hasObservers()) {
                            this.onBeforeMoveObservable.notifyObservers(this.transform);
                        }
                        // ..
                        // Validate Root Motion Velocity
                        // ..
                        if (this.animationState != null && this.rootMotion === true) {
                            const rootMotion = this.getDeltaMotionPosition();
                            this.movementVelocity.set(rootMotion.x, 0, rootMotion.z);
                            BABYLON.Vector3.TransformNormalToRef(this.movementVelocity, this.transform.getWorldMatrix(), this.movementVelocity);
                            this.characterController.move(this.movementVelocity);
                        }
                        else {
                            this.movementVelocity.scaleInPlace(this.deltaTime);
                            this.characterController.move(this.movementVelocity);
                        }
                    }
                    // this.characterController.updatePosition = true; - Which Is Best - ???
                }
                else {
                    // this.characterController.updatePosition = false; - Which Is Best - ???
                    // FIXME: EITHER OR - ???
                    // this.characterController.setGhostWorldPosition(this.transform.position);
                    this.characterController.syncGhostToTransformPosition();
                }
            }
        }
        updateCameraController() {
            if (this.enableInput === false)
                return;
            // DUNNO FUR SURE:  if (this.isCharacterNavigating === true && this.navigationAngularSpeed > 0) allowRotation = false;
            if (this.cameraPivot != null) {
                // .. 
                // Update Camera Pivot Offset
                // ..
                if (this.targetCameraOffset.x !== 0 || this.targetCameraOffset.y !== 0 || this.targetCameraOffset.z !== 0) {
                    this.cameraPivotOffset.copyFrom(this.targetCameraOffset);
                }
                else {
                    this.cameraPivotOffset.set(0, this.pivotHeight, 0);
                }
                // ..
                // Update Camera Pivot Position
                // ..
                UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.cameraPivot.position, this.cameraPivotOffset);
                // ..
                // Update Camera Pivot Rotation
                // ..
                if (this.rotateCamera === true) {
                    BABYLON.Quaternion.FromEulerAnglesToRef(this.playerRotationVector.x, this.playerRotationVector.y, 0, this.cameraPivot.rotationQuaternion);
                }
            }
            if (this.rotateCamera === true && this.cameraNode != null) {
                if (this.cameraSmoothing <= 0)
                    this.cameraSmoothing = 5.0; // Default Camera Smoothing
                if (this.cameraCollisions === true) {
                    // ..
                    // Check Camera Collision
                    // ..
                    // const maxDistance:number = Math.abs(this.boomPosition.z);
                    const parentNode = this.cameraNode.parent;
                    this.dollyDirection.scaleToRef(this.maxDistance, this.scaledMaxDirection);
                    this.dollyDirection.scaleToRef(this.cameraDistance, this.scaledCamDirection);
                    UNITY.Utilities.GetAbsolutePositionToRef(parentNode, this.parentNodePosition);
                    UNITY.Utilities.TransformPointToRef(parentNode, this.scaledMaxDirection, this.maximumCameraPos);
                    // ..
                    let contact = false;
                    let distance = 0;
                    if (this.characterController != null) {
                        // Note: Use Bullet Physics Shape Cast
                        //const raycast:UNITY.RaycastHitResult = UNITY.RigidbodyPhysics.PhysicsShapecastToPoint(this.scene, this.cameraRaycastShape, this.parentNodePosition, this.maximumCameraPos, this.defaultRaycastGroup, this.cameraRaycastMask);
                        //contact = (raycast != null && raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null);
                        //distance = (raycast != null && raycast.hasHit === true) ? raycast.hitDistance : 0;
                        //if (contact === true) {
                        //    const contactTag:string = SM.GetTransformTag(raycast.collisionObject.entity);
                        //    if (this.ignoreTriggerTags != null && this.ignoreTriggerTags !== "" && this.ignoreTriggerTags.indexOf(contactTag) >= 0) {
                        //        contact = false;
                        //        distance = 0;
                        //    }
                        //}
                    }
                    if (contact /* === true*/) {
                        this.cameraDistance = BABYLON.Scalar.Clamp((distance * this.distanceFactor), this.minimumDistance, this.maxDistance);
                        // Lerp Past Camera Collisions
                        if (this.cameraNode.position.x !== this.scaledCamDirection.x || this.cameraNode.position.y !== this.scaledCamDirection.y || this.cameraNode.position.z !== this.scaledCamDirection.z) {
                            BABYLON.Vector3.LerpToRef(this.cameraNode.position, this.scaledCamDirection, (this.deltaTime * this.cameraSmoothing), this.cameraNode.position);
                        }
                    }
                    else {
                        if (this.mouseWheel === true) {
                            if (UNITY.InputController.IsWheelScrolling()) {
                                const wheel = UNITY.InputController.GetUserInput(UNITY.UserInputAxis.Wheel);
                                if (wheel < 0) { // ZOOM OUT
                                    const zoomOutSpeed = (this.scrollSpeed * this.deltaTime);
                                    this.boomPosition.z = BABYLON.Scalar.MoveTowards(this.boomPosition.z, -this.maxDistance, zoomOutSpeed);
                                }
                                else if (wheel > 0) { // ZOOM IN
                                    const zoomInSpeed = (this.scrollSpeed * this.deltaTime);
                                    this.boomPosition.z = BABYLON.Scalar.MoveTowards(this.boomPosition.z, -this.minimumDistance, zoomInSpeed);
                                }
                            }
                        }
                        // Lerp To Camera Boom Position
                        if (this.cameraNode.position.x !== this.boomPosition.x || this.cameraNode.position.y !== this.boomPosition.y || this.cameraNode.position.z !== this.boomPosition.z) {
                            BABYLON.Vector3.LerpToRef(this.cameraNode.position, this.boomPosition, (this.deltaTime * this.cameraSmoothing), this.cameraNode.position);
                        }
                    }
                }
                else {
                    // Lerp To Camera Boom Position
                    if (this.cameraNode.position.x !== this.boomPosition.x || this.cameraNode.position.y !== this.boomPosition.y || this.cameraNode.position.z !== this.boomPosition.z) {
                        BABYLON.Vector3.LerpToRef(this.cameraNode.position, this.boomPosition, (this.deltaTime * this.cameraSmoothing), this.cameraNode.position);
                    }
                }
            }
            this.updateSmoothBoomArmLength();
        }
        getBoomArmMaxDistance() { return this.maxDistance; }
        setBoomArmMaxDistance(distance) { this.maxDistance = Math.abs(distance); }
        setSmoothBoomArmLength(length, speed, updateMaxDistance = true) {
            const absoluteLength = Math.abs(length);
            this.smoothBoomArmLength = -absoluteLength;
            this.smoothBoomArmSpeed = speed;
            if (updateMaxDistance === true) {
                const absoluteDistance = Math.abs(this.maxDistance);
                if (absoluteLength > absoluteDistance) {
                    this.setBoomArmMaxDistance(absoluteLength);
                }
            }
        }
        updateSmoothBoomArmLength() {
            if (this.smoothBoomArmLength != null && this.smoothBoomArmSpeed != null) {
                if (this.boomPosition.z !== this.smoothBoomArmLength) {
                    this.boomPosition.z = BABYLON.Scalar.MoveTowards(this.boomPosition.z, this.smoothBoomArmLength, (this.smoothBoomArmSpeed * this.getDeltaSeconds()));
                }
                else {
                    this.smoothBoomArmLength = null;
                    this.smoothBoomArmSpeed = null;
                }
            }
        }
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //  Ammo Physics Raycasting
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /*
        private castPhysicsGroundCheckRay():void {
            this.groundHit = false;
            this.groundNode = null;
            this.groundPoint.set(0,0,0);
            this.groundNormal.set(0,0,0);
            this.groundAngle = 0;
            this.groundDistance = 0;
            if (this.rayLength <= 0) this.rayLength = 0.1;
            const raycastLength:number = (this.rayLength / this.transform.scaling.y) + 0.1;
            // ..
            // Grounding Raycast Positions
            // ..
            const playerTransformDownDirection = UTIL.TransformDirection(this.transform, this.downDirection);
            this.offsetGroundRaycastPosition.set(0, this.rayOrigin, 0);
            UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.startGroundRaycastPosition, this.offsetGroundRaycastPosition);
            UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.endGroundRaycastPosition, this.downDirection.scale(raycastLength));
            this.endGroundRaycastPosition.y += this.rayOrigin;
            // ..
            // Cast Collision Shape Ray
            // ..
            if (this.radiusScale <= 0) this.radiusScale = 1.0;
            if (this.sphereCollisionShape == null) this.sphereCollisionShape = UNITY.SceneManager.CreatePhysicsSphereShape(this.avatarRadius * this.radiusScale);
            const raycast:UNITY.RaycastHitResult = UNITY.SceneManager.PhysicsShapecast(this.scene, this.sphereCollisionShape, this.startGroundRaycastPosition, playerTransformDownDirection, raycastLength, this.defaultRaycastGroup, this.defaultRaycastMask);
            // DEPRECIATED: const raycast:UNITY.RaycastHitResult = UNITY.SceneManager.PhysicsRaycast(this.scene, this.startGroundRaycastPosition, playerTransformDownDirection, raycastLength, this.defaultRaycastGroup, this.defaultRaycastMask);
            if (raycast != null && raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                this.groundHit = true;
                this.groundNode = raycast.collisionObject.entity;
                if (raycast.hitPoint != null) this.groundPoint.copyFrom(raycast.hitPoint);
                if (raycast.hitNormal != null) this.groundNormal.copyFrom(raycast.hitNormal);
                this.groundAngle = (this.groundHit === true) ? Math.abs(UNITY.Utilities.GetAngle(this.groundNormal, BABYLON.Vector3.UpReadOnly)) : 0;
                if (this.groundAngle >= 88) this.groundAngle = 0; // Note: Zero Max 88 Degree Ground Angle
                this.groundDistance = (raycast.hitDistance - this.rayOrigin);
            }
            // Ground Draw Debug Line
            if (this.showDebugColliders === true) {
                if (this.groundSensorLine == null) this.groundSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".GroundSensorLine", this.scene);
                if (raycast != null && this.groundHit === true) {
                    this.groundSensorLine.drawLine([this.startGroundRaycastPosition, raycast.hitPoint], BABYLON.Color3.Red());
                } else {
                  this.groundSensorLine.drawLine([this.startGroundRaycastPosition, this.endGroundRaycastPosition], BABYLON.Color3.Green());
                }
            }
        }
        */
        castPhysicsClimbingVolumeRay() {
            let raycast = null;
            this.climbContact = false;
            this.climbContactNode = null;
            this.climbContactPoint.set(0, 0, 0);
            this.climbContactNormal.set(0, 0, 0);
            this.climbContactAngle = 0;
            this.climbContactDistance = 0;
            // ..
            // Climbing Raycast Positions
            // ..
            const playerTransformForwardDirection = UTIL.TransformDirection(this.transform, this.forwardDirection);
            this.offsetClimbRaycastPosition.set(0, this.rayClimbOffset, 0);
            UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.startClimbRaycastPosition, this.offsetClimbRaycastPosition);
            UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.endClimbRaycastPosition, this.forwardDirection.scale(this.rayClimbLength));
            this.endClimbRaycastPosition.y += this.rayClimbOffset;
            // ..
            // raycast = UNITY.RigidbodyPhysics.PhysicsRaycast(this.scene, this.startClimbRaycastPosition, playerTransformForwardDirection, this.rayClimbLength, this.defaultRaycastGroup, this.defaultRaycastMask);
            if (raycast != null && raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                const checkTag = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                if (checkTag === this.climbVolumeTag) {
                    this.climbContact = true;
                    this.climbContactNode = raycast.collisionObject.entity;
                    if (raycast.hitPoint != null)
                        this.climbContactPoint.copyFrom(raycast.hitPoint);
                    if (raycast.hitNormal != null)
                        this.climbContactNormal.copyFrom(raycast.hitNormal);
                    this.climbContactAngle = (this.climbContactNormal != null) ? Math.abs(UNITY.Utilities.GetAngle(this.climbContactNormal, BABYLON.Vector3.UpReadOnly)) : 0;
                    this.climbContactDistance = raycast.hitDistance;
                }
            }
            // Climbing Draw Debug Line
            if (this.showDebugColliders === true) {
                if (this.climbSensorLine == null)
                    this.climbSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".ClimbingSensorLine", this.scene);
                if (raycast != null && this.climbContact === true) {
                    this.climbSensorLine.drawLine([this.startClimbRaycastPosition, raycast.hitPoint], BABYLON.Color3.Red());
                }
                else {
                    this.climbSensorLine.drawLine([this.startClimbRaycastPosition, this.endClimbRaycastPosition], BABYLON.Color3.Green());
                }
            }
        }
        castPhysicsHeightCheckVolumeRay() {
            let raycast = null;
            this.heightContact = false;
            this.heightContactNode = null;
            this.heightContactPoint.set(0, 0, 0);
            this.heightContactNormal.set(0, 0, 0);
            this.heightContactAngle = 0;
            this.heightContactDistance = 0;
            // ..
            // Height Check Raycast Positions
            // ..
            const playerTransformHeightDirection = UTIL.TransformDirection(this.transform, this.downDirection);
            if (this.climbContact === true) {
                this.endHeightRaycastPosition.copyFrom(this.climbContactPoint);
                this.startHeightRaycastPosition.copyFrom(this.climbContactPoint);
                this.startHeightRaycastPosition.addInPlace(BABYLON.Vector3.UpReadOnly.scale(this.rayHeightLength));
                // raycast = UNITY.RigidbodyPhysics.PhysicsRaycast(this.scene, this.startHeightRaycastPosition, playerTransformHeightDirection, this.rayHeightLength, this.defaultRaycastGroup, this.defaultRaycastMask);
            }
            else {
                this.offsetHeightRaycastPosition.set(0, this.rayHeightOffset, this.rayClimbLength);
                UNITY.Utilities.GetAbsolutePositionToRef(this.transform, this.startHeightRaycastPosition, this.offsetHeightRaycastPosition);
                this.endHeightRaycastPosition.copyFrom(this.startHeightRaycastPosition);
                this.endHeightRaycastPosition.addInPlace(this.downDirection.scale(this.rayHeightLength));
            }
            // ..
            if (raycast != null && raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                const checkTag = UNITY.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                if (checkTag === this.climbVolumeTag) {
                    this.heightContact = true;
                    this.heightContactNode = raycast.collisionObject.entity;
                    if (raycast.hitPoint != null)
                        this.heightContactPoint.copyFrom(raycast.hitPoint);
                    if (raycast.hitNormal != null)
                        this.heightContactNormal.copyFrom(raycast.hitNormal);
                    this.heightContactAngle = (this.heightContactNormal != null) ? Math.abs(UNITY.Utilities.GetAngle(this.heightContactNormal, BABYLON.Vector3.UpReadOnly)) : 0;
                    this.heightContactDistance = raycast.hitDistance;
                }
            }
            // Height Check Draw Debug Line
            if (this.showDebugColliders === true) {
                if (this.heightSensorLine == null)
                    this.heightSensorLine = new UNITY.LinesMeshRenderer(this.transform.name + ".HeightCheckSensorLine", this.scene);
                if (raycast != null && this.heightContact === true) {
                    this.heightSensorLine.drawLine([this.startHeightRaycastPosition, raycast.hitPoint], BABYLON.Color3.Red());
                }
                else {
                    this.heightSensorLine.drawLine([this.startHeightRaycastPosition, this.endHeightRaycastPosition], BABYLON.Color3.Green());
                }
            }
        }
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //  Private Worker Functions
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        getCheckedVerticalVelocity() {
            const currentVelocity = (this.characterController != null) ? this.characterController.getVerticalVelocity() : 0;
            return (Math.abs(currentVelocity) >= PROJECT.ThirdPersonPlayerController.MIN_VERTICAL_VELOCITY) ? currentVelocity : 0;
        }
        destroyPlayerController() {
            this.cameraPivot = null;
            this.cameraNode = null;
            this.animationState = null;
            this.characterController = null;
            this.onPreUpdateObservable.clear();
            this.onPreUpdateObservable = null;
            this.onBeforeMoveObservable.clear();
            this.onBeforeMoveObservable = null;
            this.onPostUpdateObservable.clear();
            this.onPostUpdateObservable = null;
        }
        validateAnimationStateParams() {
            if (this.animationStateParams == null) {
                this.animationStateParams = {
                    moveDirection: "Direction",
                    inputMagnitude: "Magnitude",
                    horizontalInput: "Horizontal",
                    verticalInput: "Vertical",
                    mouseXInput: "MouseX",
                    mouseYInput: "MouseY",
                    heightInput: "Height",
                    speedInput: "Speed",
                    jumpFrame: "Jumped",
                    jumpState: "Jump",
                    actionState: "Action",
                    fallingState: "FreeFall",
                    slidingState: "Sliding",
                    groundedState: "Grounded",
                };
            }
        }
    }
    ThirdPersonPlayerController.MIN_VERTICAL_VELOCITY = 0.01;
    ThirdPersonPlayerController.MIN_GROUND_DISTANCE = 0.15;
    ThirdPersonPlayerController.MIN_MOVE_EPSILON = 0.001;
    ThirdPersonPlayerController.MIN_TIMER_OFFSET = 0;
    ThirdPersonPlayerController.MIN_SLOPE_LIMIT = 0;
    ThirdPersonPlayerController.PLAYER_HEIGHT = "playerHeight";
    PROJECT.ThirdPersonPlayerController = ThirdPersonPlayerController;
    /**
    * Babylon Enum Definition
    * @interface ThirdPersonControl
    */
    let ThirdPersonControl;
    (function (ThirdPersonControl) {
        ThirdPersonControl[ThirdPersonControl["ThirdPersonTurning"] = 0] = "ThirdPersonTurning";
        ThirdPersonControl[ThirdPersonControl["ThirdPersonForward"] = 1] = "ThirdPersonForward";
    })(ThirdPersonControl = PROJECT.ThirdPersonControl || (PROJECT.ThirdPersonControl = {}));
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class FxParticleSystem
    */
    class FxParticleSystem extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.m_particleEmitter = null;
            this.m_particleSystem = null;
        }
        getParticleEmitter() { return this.m_particleEmitter; }
        getParticleSystem() { return this.m_particleSystem; }
        awake() {
            const rootUrl = UNITY.SceneManager.GetRootUrl(this.scene);
            const classType = this.getProperty("classType", 0);
            const particleText = this.getProperty("base64ParticleSystem");
            const playOnAwake = this.getProperty("playOnAwake", false);
            const particleTexture = this.getProperty("particleTexture");
            this.m_particleEmitter = this.getAbstractMesh();
            if (this.m_particleEmitter == null) {
                this.m_particleEmitter = BABYLON.MeshBuilder.CreateBox(this.transform.name + ".Emitter", { size: 0.25 }, this.scene);
                this.m_particleEmitter.parent = this.transform;
                this.m_particleEmitter.position.set(0, 0, 0);
                this.m_particleEmitter.isVisible = false;
                this.m_particleEmitter.isPickable = false;
                this.m_particleEmitter.material = UNITY.Utilities.GetColliderMaterial(this.scene);
            }
            if (particleText != null && particleText !== "") {
                const particleJson = window.atob(particleText);
                if (particleJson != null && particleJson !== "") {
                    const particleParsed = JSON.parse(particleJson);
                    if (particleParsed != null) {
                        if (particleParsed.texture != null && particleTexture != null) {
                            particleParsed.texture.name = particleTexture.filename; // Note: Particle System Parser Use Name Not Url
                            particleParsed.texture.url = particleTexture.filename; // Note: Particle System Parser Use Name Not Url
                        }
                        if (classType === 1) { // GPU Particle System
                            this.m_particleSystem = BABYLON.GPUParticleSystem.Parse(particleParsed, this.scene, rootUrl);
                        }
                        else { // CPU Particle System
                            this.m_particleSystem = BABYLON.ParticleSystem.Parse(particleParsed, this.scene, rootUrl);
                        }
                        if (this.m_particleSystem != null) {
                            if (this.m_particleEmitter != null)
                                this.m_particleSystem.emitter = this.m_particleEmitter;
                            if (playOnAwake === false)
                                this.m_particleSystem.stop();
                        }
                    }
                }
            }
        }
        destroy() {
            this.m_particleEmitter = null;
            if (this.m_particleSystem != null) {
                this.m_particleSystem.dispose();
                this.m_particleSystem = null;
            }
        }
    }
    PROJECT.FxParticleSystem = FxParticleSystem;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
     * Babylon water material system pro class (Babylon Water Material)
     * @class SkyMaterialSystem - All rights reserved (c) 2020 Mackey Kinard
     */
    class SkyMaterialSystem extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.skyfog = false;
            this.skysize = 1000;
            this.probesize = 128;
            this.reflections = false;
            this.reflectlevel = 1;
            this.skytintcolor = new BABYLON.Color3(1, 1, 1);
            this.m_skyboxMesh = null;
            this.m_skyMaterial = null;
            this.m_reflectProbe = null;
        }
        getSkyboxMesh() { return this.m_skyboxMesh; }
        getSkyMaterial() { return this.m_skyMaterial; }
        getReflectionProbe() { return this.m_reflectProbe; }
        awake() { this.awakeSkyboxMaterial(); }
        start() { }
        update() { }
        late() { }
        after() { }
        destroy() { this.destroySkyboxMaterial(); }
        awakeSkyboxMaterial() {
            this.skyfog = this.getProperty("applyMeshFog", this.skyfog);
            this.skysize = this.getProperty("boxSize", this.skysize);
            this.probesize = this.getProperty("probeSize", this.probesize);
            this.reflections = this.getProperty("reflections", this.reflections);
            this.reflectlevel = this.getProperty("reflectLevel", this.reflectlevel);
            // ..
            const tintColor = this.getProperty("tintColor");
            if (tintColor != null)
                this.skytintcolor = UNITY.Utilities.ParseColor3(tintColor);
            // ..
            this.m_skyboxMesh = BABYLON.MeshBuilder.CreateBox("Ambient Skybox", { size: this.skysize }, this.scene);
            this.m_skyboxMesh.position.set(0, 0, 0);
            this.m_skyboxMesh.infiniteDistance = true;
            this.m_skyboxMesh.applyFog = this.skyfog;
            if (this.scene.useRightHandedSystem === true)
                this.m_skyboxMesh.scaling.x *= -1;
            // Setup Sky Material Properties
            this.m_skyMaterial = new BABYLON.SkyMaterial(this.transform.name + ".SkyMaterial", this.scene);
            this.m_skyMaterial.backFaceCulling = false;
            this.setSkyboxTintColor(this.skytintcolor);
            /**
             * Defines the overall luminance of sky in interval [0, 1].
             */
            this.m_skyMaterial.luminance = this.getProperty("luminance", this.m_skyMaterial.luminance);
            /**
            * Defines the amount (scattering) of haze as opposed to molecules in atmosphere.
            */
            this.m_skyMaterial.turbidity = this.getProperty("turbidity", this.m_skyMaterial.turbidity);
            /**
             * Defines the sky appearance (light intensity).
             */
            this.m_skyMaterial.rayleigh = this.getProperty("rayleigh", this.m_skyMaterial.rayleigh);
            /**
             * Defines the mieCoefficient in interval [0, 0.1] which affects the property .mieDirectionalG.
             */
            this.m_skyMaterial.mieCoefficient = this.getProperty("mieCoefficient", this.m_skyMaterial.mieCoefficient);
            /**
             * Defines the amount of haze particles following the Mie scattering theory.
             */
            this.m_skyMaterial.mieDirectionalG = this.getProperty("mieDirectionalG", this.m_skyMaterial.mieDirectionalG);
            /**
             * Defines the distance of the sun according to the active scene camera.
             */
            this.m_skyMaterial.distance = this.getProperty("distance", this.m_skyMaterial.distance);
            /**
             * Defines the sun inclination, in interval [-0.5, 0.5]. When the inclination is not 0, the sun is said
             * "inclined".
             */
            this.m_skyMaterial.inclination = this.getProperty("inclination", this.m_skyMaterial.inclination);
            /**
             * Defines the solar azimuth in interval [0, 1]. The azimuth is the angle in the horizontal plan between
             * an object direction and a reference direction.
             */
            this.m_skyMaterial.azimuth = this.getProperty("azimuth", this.m_skyMaterial.azimuth);
            /**
             * Defines an offset vector used to get a horizon offset.
             * @example skyMaterial.cameraOffset.y = camera.globalPosition.y // Set horizon relative to 0 on the Y axis
             */
            const camOffsetData = this.getProperty("cameraOffset");
            if (camOffsetData != null)
                this.m_skyMaterial.cameraOffset = UNITY.Utilities.ParseVector3(camOffsetData);
            /**
             * Defines if the sun position should be computed (inclination and azimuth) according to the scene
             * sun position.
             */
            this.m_skyMaterial.useSunPosition = this.getProperty("useSunPosition", this.m_skyMaterial.useSunPosition);
            this.m_skyMaterial.sunPosition = new BABYLON.Vector3(0, 50, 0);
            if (this.scene.metadata != null && this.scene.metadata.unity != null && this.scene.metadata.unity) {
                if (this.scene.metadata.unity.sunposition != null) {
                    this.m_skyMaterial.sunPosition = UNITY.Utilities.ParseVector3(this.scene.metadata.unity.sunposition);
                }
            }
            // Assign Sky Material To Skybox Mesh
            this.m_skyboxMesh.material = this.m_skyMaterial;
            // Setup Environment Reflection Probe Texture
            if (this.reflections === true) {
                this.m_reflectProbe = new BABYLON.ReflectionProbe("Skybox-ReflectionProbe", this.probesize, this.scene);
                this.m_reflectProbe.renderList.push(this.m_skyboxMesh);
                this.scene.customRenderTargets.push(this.m_reflectProbe.cubeTexture);
                this.scene.environmentTexture = this.m_reflectProbe.cubeTexture;
                this.scene.environmentIntensity = this.reflectlevel;
            }
        }
        destroySkyboxMaterial() {
            if (this.m_skyboxMesh != null) {
                this.m_skyboxMesh.dispose();
                this.m_skyboxMesh = null;
            }
            if (this.m_reflectProbe != null) {
                this.m_reflectProbe.dispose();
                this.m_reflectProbe = null;
            }
            if (this.m_skyMaterial != null) {
                this.m_skyMaterial.dispose();
                this.m_skyMaterial = null;
            }
        }
        /** Set Skybox Mesh tint color. (Box Mesh Vertex Colors) */
        setSkyboxTintColor(color) {
            const colors = [];
            const numVertices = this.m_skyboxMesh.getTotalVertices();
            for (let i = 0; i < numVertices; ++i) {
                colors.push(color.r, color.g, color.b, 1.0);
            }
            this.m_skyboxMesh.setVerticesData("color", colors);
            this.m_skyboxMesh.useVertexColors = true;
        }
    }
    PROJECT.SkyMaterialSystem = SkyMaterialSystem;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
     * Babylon water material system pro class (Babylon Water Material)
     * @class WaterMaterialSystem - All rights reserved (c) 2020 Mackey Kinard
     */
    class WaterMaterialSystem extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.waterTag = "Water";
            this.targetSize = new BABYLON.Vector2(128, 128);
            this.renderSize = new BABYLON.Vector2(512, 512);
            this.depthFactor = 1.0;
            this.reflectSkybox = true;
            this.subDivisions = 32;
            this.heightOffset = 1.0;
            this.windDirection = new BABYLON.Vector2(0, 1);
            this.windForce = 6;
            this.waveSpeed = 1.0;
            this.waveLength = 0.4;
            this.waveHeight = 0.4;
            this.bumpHeight = 0.4;
            this.waterColor = new BABYLON.Color3(0.1, 0.1, 0.6);
            this.colorBlendFactor = 0.2;
            this.waterColor2 = new BABYLON.Color3(0.1, 0.1, 0.6);
            this.colorBlendFactor2 = 0.2;
            this.disableClipPlane = false;
            this.m_waterGeometry = null;
            this.m_waterMaterial = null;
        }
        getWaterGeometry() { return this.m_waterGeometry; }
        getWaterMaterial() { return this.m_waterMaterial; }
        awake() {
            this.waterTag = this.getProperty("waterTag", this.waterTag);
            this.depthFactor = this.getProperty("depthFactor", this.depthFactor);
            this.subDivisions = this.getProperty("subDivisions", this.subDivisions);
            this.heightOffset = this.getProperty("heightOffset", this.heightOffset);
            this.reflectSkybox = this.getProperty("reflectSkybox", this.reflectSkybox);
            this.windForce = this.getProperty("windForce", this.windForce);
            this.waveSpeed = this.getProperty("waveSpeed", this.waveSpeed);
            this.waveLength = this.getProperty("waveLength", this.waveLength);
            this.waveHeight = this.getProperty("waveHeight", this.waveHeight);
            this.bumpHeight = this.getProperty("bumpHeight", this.bumpHeight);
            this.bumpSuperimpose = this.getProperty("bumpSuperimpose", this.bumpSuperimpose);
            this.bumpAffectsReflection = this.getProperty("bumpAffectsReflection", this.bumpAffectsReflection);
            this.colorBlendFactor = this.getProperty("colorBlendFactor", this.colorBlendFactor);
            this.colorBlendFactor2 = this.getProperty("colorBlendFactor2", this.colorBlendFactor2);
            this.disableClipPlane = this.getProperty("disableClipPlane", this.disableClipPlane);
            this.fresnelSeparate = this.getProperty("fresnelSeparate", this.fresnelSeparate);
            // ..
            const wcolor1 = this.getProperty("waterColor");
            this.waterColor = UNITY.Utilities.ParseColor3(wcolor1);
            // ..
            const wcolor2 = this.getProperty("waterColor2");
            this.waterColor2 = UNITY.Utilities.ParseColor3(wcolor2);
            // ..
            const wdirection = this.getProperty("windDirection");
            this.windDirection = UNITY.Utilities.ParseVector2(wdirection);
            // ..
            const itargetsize = this.getProperty("targetSize");
            if (itargetsize != null)
                this.targetSize = UNITY.Utilities.ParseVector2(itargetsize);
            // ..        
            const irendersize = this.getProperty("renderSize");
            if (irendersize != null)
                this.renderSize = UNITY.Utilities.ParseVector2(irendersize);
            /* Awake component function */
            let bumpTexture = null;
            const bumpTextureData = this.getProperty("bumpTexture");
            if (bumpTextureData != null)
                bumpTexture = UNITY.Utilities.ParseTexture(bumpTextureData, this.scene);
            if (bumpTexture != null) {
                this.m_waterMaterial = new BABYLON.WaterMaterial(this.transform.name + ".Water", this.scene, this.renderSize);
                this.m_waterMaterial.bumpTexture = bumpTexture;
                this.m_waterMaterial.windDirection = this.windDirection;
                this.m_waterMaterial.windForce = this.windForce;
                this.m_waterMaterial.waveSpeed = this.waveSpeed;
                this.m_waterMaterial.waveLength = this.waveLength;
                this.m_waterMaterial.waveHeight = this.waveHeight;
                this.m_waterMaterial.bumpHeight = this.bumpHeight;
                this.m_waterMaterial.bumpSuperimpose = this.bumpSuperimpose;
                this.m_waterMaterial.bumpAffectsReflection = this.bumpAffectsReflection;
                this.m_waterMaterial.waterColor = this.waterColor;
                this.m_waterMaterial.colorBlendFactor = this.colorBlendFactor;
                this.m_waterMaterial.waterColor2 = this.waterColor2;
                this.m_waterMaterial.colorBlendFactor2 = this.colorBlendFactor2;
                this.m_waterMaterial.disableClipPlane = this.disableClipPlane;
                this.m_waterMaterial.fresnelSeparate = this.fresnelSeparate;
                // ..
                // Water Material Tags
                // ..
                if (this.reflectSkybox === true) {
                    const skyboxMesh = UNITY.SceneManager.GetDefaultSkybox(this.scene);
                    if (skyboxMesh != null)
                        this.m_waterMaterial.addToRenderList(skyboxMesh);
                }
                if (this.waterTag != null && this.waterTag !== "") {
                    const waterMeshes = this.scene.getMeshesByTags(this.waterTag);
                    if (waterMeshes != null && waterMeshes.length > 0) {
                        waterMeshes.forEach((mesh) => {
                            this.m_waterMaterial.addToRenderList(mesh);
                        });
                    }
                }
                // ..
                // Water Material Mesh
                // ..
                this.m_waterGeometry = BABYLON.MeshBuilder.CreateGround(this.transform.name + ".WaterMesh", { width: this.targetSize.x, height: this.targetSize.y, subdivisions: this.subDivisions, updatable: false }, this.scene);
                this.m_waterGeometry.parent = this.transform;
                this.m_waterGeometry.position.set(0, this.heightOffset, 0);
                if (this.depthFactor > 0)
                    this.m_waterGeometry.scaling.y *= this.depthFactor;
                this.m_waterGeometry.material = this.m_waterMaterial;
            }
            else {
                UNITY.SceneManager.LogWarning("No supported water bump texture for: " + this.transform.name);
            }
        }
        start() { }
        update() { }
        late() { }
        after() { }
        destroy() { }
    }
    PROJECT.WaterMaterialSystem = WaterMaterialSystem;
})(PROJECT || (PROJECT = {}));
var BABYLON;
(function (BABYLON) {
    /**
     * Babylon windows platform pro class
     * @class WindowsPlatform - All rights reserved (c) 2020 Mackey Kinard
     */
    class WindowsPlatform {
        /** Is xbox live user signed in if platform services enabled. (WinRT) */
        static IsXboxLiveUserSignedIn(systemUser = null, player = UNITY.PlayerNumber.One) {
            if (UNITY.WindowManager.IsWindows()) {
                let user = (systemUser != null) ? BABYLON.WindowsPlatform.GetXboxLiveSystemUser(systemUser, player) : BABYLON.WindowsPlatform.GetXboxLiveUser(player);
                return (user != null && user.isSignedIn == true);
            }
            else {
                return false;
            }
        }
        /** Validated sign in xbox live user if platform services available. (WinRT) */
        static XboxLiveUserSignIn(player = UNITY.PlayerNumber.One, oncomplete, onerror, onprogress) {
            if (UNITY.WindowManager.IsWindows()) {
                BABYLON.WindowsPlatform.XboxLiveUserSilentSignIn(player, (first) => {
                    if (first.status === Microsoft.Xbox.Services.System.SignInStatus.userInteractionRequired) {
                        BABYLON.WindowsPlatform.XboxLiveUserDialogSignIn(player, (second) => {
                            if (oncomplete)
                                oncomplete(second);
                        }, onerror, onprogress);
                    }
                    else {
                        if (oncomplete)
                            oncomplete(first);
                    }
                }, onerror, onprogress);
            }
        }
        /** Silent sign in xbox live user if platform services available. (WinRT) */
        static XboxLiveUserSilentSignIn(player = UNITY.PlayerNumber.One, oncomplete, onerror, onprogress) {
            return (UNITY.WindowManager.IsWindows()) ? BABYLON.WindowsPlatform.GetXboxLiveUser(player).signInSilentlyAsync(null).then(oncomplete, onerror, onprogress) : null;
        }
        /** Dialog sign in xbox live user if platform services available. (WinRT) */
        static XboxLiveUserDialogSignIn(player = UNITY.PlayerNumber.One, oncomplete, onerror, onprogress) {
            return (UNITY.WindowManager.IsWindows()) ? BABYLON.WindowsPlatform.GetXboxLiveUser(player).signInAsync(null).then(oncomplete, onerror, onprogress) : null;
        }
        /** Loads a xbox live user profile if platform services available. (WinRT) */
        static LoadXboxLiveUserProfile(player = UNITY.PlayerNumber.One, oncomplete, onerror, onprogress) {
            return (UNITY.WindowManager.IsWindows()) ? BABYLON.WindowsPlatform.GetXboxLiveUserContext(player).profileService.getUserProfileAsync(BABYLON.WindowsPlatform.GetXboxLiveUser(player).xboxUserId).then(oncomplete, onerror, onprogress) : null;
        }
        // ************************************** //
        // * Babylon Xbox Live Player Functions * //
        // ************************************** //
        /** Get xbox live user if platform services available. (WinRT) */
        static GetXboxLiveUser(player = UNITY.PlayerNumber.One) {
            let user = null;
            if (UNITY.WindowManager.IsWindows()) {
                switch (player) {
                    case UNITY.PlayerNumber.One:
                        user = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveUserOne();
                        break;
                    case UNITY.PlayerNumber.Two:
                        user = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveUserTwo();
                        break;
                    case UNITY.PlayerNumber.Three:
                        user = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveUserThree();
                        break;
                    case UNITY.PlayerNumber.Four:
                        user = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveUserFour();
                        break;
                }
            }
            return user;
        }
        /** Get xbox live user if platform services available. (WinRT) */
        static GetXboxLiveSystemUser(systemUser, player = UNITY.PlayerNumber.One) {
            let user = null;
            if (UNITY.WindowManager.IsWindows()) {
                switch (player) {
                    case UNITY.PlayerNumber.One:
                        user = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveSystemUserOne(systemUser);
                        break;
                    case UNITY.PlayerNumber.Two:
                        user = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveSystemUserTwo(systemUser);
                        break;
                    case UNITY.PlayerNumber.Three:
                        user = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveSystemUserThree(systemUser);
                        break;
                    case UNITY.PlayerNumber.Four:
                        user = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveSystemUserFour(systemUser);
                        break;
                }
            }
            return user;
        }
        /** Get xbox live user context if platform services available. (WinRT) */
        static GetXboxLiveUserContext(player = UNITY.PlayerNumber.One) {
            let context = null;
            if (UNITY.WindowManager.IsWindows()) {
                switch (player) {
                    case UNITY.PlayerNumber.One:
                        context = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveContextOne();
                        break;
                    case UNITY.PlayerNumber.Two:
                        context = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveContextTwo();
                        break;
                    case UNITY.PlayerNumber.Three:
                        context = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveContextThree();
                        break;
                    case UNITY.PlayerNumber.Four:
                        context = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveContextFour();
                        break;
                }
            }
            return context;
        }
        /** Resets xbox live user context if platform services available. (WinRT) */
        static ResetXboxLiveUserContext(player = UNITY.PlayerNumber.One) {
            if (UNITY.WindowManager.IsWindows()) {
                switch (player) {
                    case UNITY.PlayerNumber.One:
                        window.BabylonToolkit.XboxLive.Plugin.resetXboxLiveUserContextOne();
                        break;
                    case UNITY.PlayerNumber.Two:
                        window.BabylonToolkit.XboxLive.Plugin.resetXboxLiveUserContextTwo();
                        break;
                    case UNITY.PlayerNumber.Three:
                        window.BabylonToolkit.XboxLive.Plugin.resetXboxLiveUserContextThree();
                        break;
                    case UNITY.PlayerNumber.Four:
                        window.BabylonToolkit.XboxLive.Plugin.resetXboxLiveUserContextFour();
                        break;
                }
            }
        }
        // *************************************** //
        // * Babylon Xbox Live Context Functions * //
        // *************************************** //
        /** Get xbox live context property if platform services available. (WinRT) */
        static GetXboxLiveContextProperty(name) {
            return (UNITY.WindowManager.IsWindows()) ? window.BabylonToolkit.XboxLive.Plugin.getXboxLiveContextProperty(name) : null;
        }
        /** Get xbox live context property if platform services available. (WinRT) */
        static SetXboxLiveContextProperty(name, property) {
            if (UNITY.WindowManager.IsWindows()) {
                window.BabylonToolkit.XboxLive.Plugin.setXboxLiveContextProperty(name, property);
            }
        }
        /** Resets xbox live property context bag if platform services available. (WinRT) */
        static ResetXboxLivePropertyContexts() {
            if (UNITY.WindowManager.IsWindows()) {
                window.BabylonToolkit.XboxLive.Plugin.resetXboxLivePropertyContexts();
            }
        }
        // **************************************** //
        // * Babylon Xbox Live Sign Out Functions * //
        // **************************************** //
        /** Sets the Xbox User Sign Out Complete Handler (WinRT) */
        static SetXboxLiveSignOutHandler(handler = null) {
            if (UNITY.WindowManager.IsWindows()) {
                window.BabylonToolkit.XboxLive.Plugin.onusersignout = handler;
            }
        }
    }
    BABYLON.WindowsPlatform = WindowsPlatform;
})(BABYLON || (BABYLON = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class PaintShop
    */
    class PaintShop extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.carMaterial = 0;
            this.raceCarBody = null;
            this.raceCarDriver = null;
        }
        awake() {
            if (this.carMaterial > 0)
                this.setCarMaterial(this.carMaterial);
        }
        destroy() {
            this.raceCarBody = null;
        }
        setCarMaterial(oneBasedIndex) {
            let carMaterialName = null;
            const zeroBasedIndex = BABYLON.Scalar.Clamp((oneBasedIndex - 1), 0, 19);
            switch (zeroBasedIndex) {
                case 0:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_01;
                    break;
                case 1:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_02;
                    break;
                case 2:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_03;
                    break;
                case 3:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_04;
                    break;
                case 4:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_05;
                    break;
                case 5:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_06;
                    break;
                case 6:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_07;
                    break;
                case 7:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_08;
                    break;
                case 8:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_09;
                    break;
                case 9:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_10;
                    break;
                case 10:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_11;
                    break;
                case 11:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_12;
                    break;
                case 12:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_13;
                    break;
                case 13:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_14;
                    break;
                case 14:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_15;
                    break;
                case 15:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_16;
                    break;
                case 16:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_17;
                    break;
                case 17:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_18;
                    break;
                case 18:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_19;
                    break;
                case 19:
                    carMaterialName = PROJECT.PaintShop.CAR_MATERIAL_20;
                    break;
            }
            if (this.raceCarBody != null && carMaterialName != null && carMaterialName !== "") {
                const material = this.scene.getMaterialByName(carMaterialName, true);
                if (material != null && material instanceof BABYLON.PBRMaterial) {
                    this.raceCarBody.material = material;
                }
                else {
                    BABYLON.Tools.Warn("Failed to locate race car material: " + carMaterialName);
                }
            }
        }
    }
    PaintShop.CAR_MATERIAL_01 = "RaceCar V02 C01";
    PaintShop.CAR_MATERIAL_02 = "RaceCar V02 C02";
    PaintShop.CAR_MATERIAL_03 = "RaceCar V02 C03";
    PaintShop.CAR_MATERIAL_04 = "RaceCar V02 C04";
    PaintShop.CAR_MATERIAL_05 = "RaceCar V02 C05";
    PaintShop.CAR_MATERIAL_06 = "RaceCar V02 C06";
    PaintShop.CAR_MATERIAL_07 = "RaceCar V02 C07";
    PaintShop.CAR_MATERIAL_08 = "RaceCar V02 C08";
    PaintShop.CAR_MATERIAL_09 = "RaceCar V02 C09";
    PaintShop.CAR_MATERIAL_10 = "RaceCar V02 C10";
    PaintShop.CAR_MATERIAL_11 = "RaceCar V02 C11";
    PaintShop.CAR_MATERIAL_12 = "RaceCar V02 C12";
    PaintShop.CAR_MATERIAL_13 = "RaceCar V02 C13";
    PaintShop.CAR_MATERIAL_14 = "RaceCar V02 C14";
    PaintShop.CAR_MATERIAL_15 = "RaceCar V02 C15";
    PaintShop.CAR_MATERIAL_16 = "RaceCar V02 C16";
    PaintShop.CAR_MATERIAL_17 = "RaceCar V02 C17";
    PaintShop.CAR_MATERIAL_18 = "RaceCar V02 C18";
    PaintShop.CAR_MATERIAL_19 = "RaceCar V02 C19";
    PaintShop.CAR_MATERIAL_20 = "RaceCar V02 C20";
    PROJECT.PaintShop = PaintShop;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class RacingHud
    */
    class RacingHud extends UNITY.ScriptComponent {
        // Example: private helloWorld:string = "Hello World";
        awake() {
            /* Init component function */
        }
        start() {
            /* Start component function */
        }
        fixed() {
            /* Fixed update loop function */
        }
        update() {
            /* Update render loop function */
        }
        late() {
            /* Late update render loop function */
        }
        after() {
            /* After update render loop function */
        }
        ready() {
            /* Execute when ready function */
        }
        destroy() {
            /* Destroy component function */
        }
    }
    PROJECT.RacingHud = RacingHud;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component (Written By: Mackey Kinard)
    * @class Camera_BigScreens
    */
    class Camera_BigScreens extends UNITY.ScriptComponent {
        static get Instance() { return PROJECT.Camera_BigScreens._StaticInstance; }
        SwitchActiveView(updatePlayer = 1, updateMount = 99) { if (this.renderTexture != null)
            this.switchCameraLocation(updatePlayer, updateMount); }
        ActivateMainCamera() { if (this.main != null)
            this.scene.activeCamera = this.main; }
        ActivatePlayerCamera() { if (this.camera != null)
            this.scene.activeCamera = this.camera; }
        GetPlayerFocusVehicle() { return this.focusPlayerVehicle; }
        constructor(transform, scene, properties) {
            super(transform, scene, properties);
            this.resolution = 1;
            this.interval = 30;
            this.cycle = 1;
            this.timer = 0;
            this.points = null;
            this.screens = null;
            this.player = null;
            this.camera = null;
            this.main = null;
            this.rearCamera = null;
            this.frontCamera = null;
            this.currentPoint = -1;
            this.currentMount = -1;
            this.currentPlayer = -1;
            this.keepAspectRatio = true;
            this.setFixedLocations = false;
            this.renderTexture = null;
            this.screenMaterial = null;
            this.focusPlayerVehicle = null;
            this.syncCameraTransform = null;
            this.lookCameraTransform = null;
            this.positionVectorBuffer = new BABYLON.Vector3(0, 0, 0);
            this.positionOffsetBuffer = new BABYLON.Vector3(0, 0, 0);
            this.relativePositionBuffer = new BABYLON.Vector3(0, 0, 0);
            this.relativeRotationBuffer = new BABYLON.Quaternion(0, 0, 0, 1);
            this.AutoSwitchCamera = true;
            this.canvasWidth = 0;
            this.canvasHeight = 0;
            PROJECT.Camera_BigScreens._StaticInstance = this;
        }
        start() {
            this.initCameraSetup();
        }
        update() {
            this.updateCamerTimer();
        }
        late() {
            this.updateCameraPosition();
        }
        destroy() {
            this.camera = null;
            this.player = null;
            this.points = null;
            this.screens = null;
            if (this.renderTexture != null) {
                this.renderTexture.dispose();
                this.renderTexture = null;
            }
            if (this.screenMaterial != null) {
                this.screenMaterial.dispose();
                this.screenMaterial = null;
            }
        }
        initCameraSetup() {
            this.main = this.scene.activeCamera;
            this.camera = this.getCameraRig();
            this.points = this.getTransformNodesWithName(this.scene, "Camera_Point");
            this.screens = this.getTransformNodesWithName(this.scene, "Screen");
            this.initScreenTextures();
            this.switchCameraLocation();
        }
        initScreenTextures() {
            const canvas = this.scene.getEngine().getRenderingCanvas();
            this.canvasWidth = (canvas.width * 0.5);
            this.canvasHeight = (canvas.height * 0.5);
            if (this.renderTexture == null)
                this.renderTexture = new BABYLON.RenderTargetTexture("BigScreenTexture", { width: this.canvasWidth, height: this.canvasHeight }, this.scene, { doNotChangeAspectRatio: this.keepAspectRatio });
            this.renderTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
            this.renderTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
            this.renderTexture.renderList = this.scene.meshes;
            this.renderTexture.activeCamera = this.camera;
            this.scene.customRenderTargets.push(this.renderTexture);
            //this.renderTexture.vScale = (this.canvasWidth / this.canvasHeight) * PROJECT.Camera_BigScreens.RTT_RATIO;
            //this.renderTexture.vOffset += (PROJECT.Camera_BigScreens.RTT_RATIO * 0.5);
            this.scene.getEngine().onResizeObservable.add(() => {
                this.canvasWidth = (canvas.width * 0.5);
                this.canvasHeight = (canvas.height * 0.5);
                this.renderTexture.resize({ width: this.canvasWidth, height: this.canvasHeight });
                //this.renderTexture.vScale = (this.canvasWidth / this.canvasHeight) * PROJECT.Camera_BigScreens.RTT_RATIO;
                //this.renderTexture.vOffset += (PROJECT.Camera_BigScreens.RTT_RATIO * 0.5);
            });
            // ..
            // Create Screen Material
            // ..
            if (this.screenMaterial == null)
                this.screenMaterial = new BABYLON.StandardMaterial("BigScreenMaterial", this.scene);
            this.screenMaterial.disableLighting = true;
            this.screenMaterial.emissiveTexture = this.renderTexture;
            // ..
            // Assign Screen Materials
            // ..
            if (this.screens != null && this.screens.length > 0) {
                this.screens.forEach((screen) => {
                    if (screen instanceof BABYLON.AbstractMesh) {
                        const instanced = (screen instanceof BABYLON.InstancedMesh);
                        if (instanced === false)
                            screen.material = this.screenMaterial;
                    }
                });
            }
        }
        updateCamerTimer() {
            if (this.renderTexture != null) {
                this.timer += this.getDeltaSeconds();
                if (this.timer >= this.interval) {
                    if (this.AutoSwitchCamera === true) {
                        this.switchCameraLocation();
                    }
                    else {
                        this.timer = 0;
                    }
                }
            }
        }
        updateCurrentPoint(updatePoint = 1) {
            if (updatePoint !== 0) {
                this.currentPoint = (this.cycle === 0 || updatePoint === 99) ? parseInt(UNITY.Utilities.GetRandomRange(0, (this.points.length - 1), this.currentPoint, 10000).toFixed(0)) : (this.currentPoint + updatePoint);
                if (this.currentPoint < 0)
                    this.currentPoint = (this.points.length - 1);
                else if (this.currentPoint > (this.points.length - 1))
                    this.currentPoint = 0;
            }
        }
        updateCurrentPlayer(updatePlayer = 1) {
            if (updatePlayer !== 0) {
                const registeredVehicles = PROJECT.RaceTrackManager.GetPlayerVehicles();
                if (registeredVehicles != null && registeredVehicles.length > 0) {
                    this.currentPlayer = (this.cycle === 0 || updatePlayer === 99) ? parseInt(UNITY.Utilities.GetRandomRange(0, (registeredVehicles.length - 1), this.currentPlayer, 10000).toFixed(0)) : (this.currentPlayer + updatePlayer);
                    if (this.currentPlayer < 0)
                        this.currentPlayer = (registeredVehicles.length - 1);
                    else if (this.currentPlayer > (registeredVehicles.length - 1))
                        this.currentPlayer = 0;
                }
            }
        }
        updateCurrentMount(updateMount = 99) {
            // DEPRECATED: this.currentMount = (this.cycle === 0 || updateMount === 99) ? parseInt(UNITY.Utilities.GetRandomRange(0, 2, this.currentMount, 10000).toFixed(0)) : (this.currentMount + updateMount);
            let nextCameraMount = parseInt(BABYLON.Scalar.RandomRange(0, 100).toFixed(0));
            if (nextCameraMount >= 70) {
                nextCameraMount = 2;
            }
            else if (nextCameraMount >= 35) {
                nextCameraMount = 1;
            }
            else if (nextCameraMount >= 0) {
                nextCameraMount = 0;
            }
            // ..
            if (nextCameraMount === this.currentMount) {
                nextCameraMount = parseInt(BABYLON.Scalar.RandomRange(0, 100).toFixed(0));
                if (nextCameraMount >= 70) {
                    nextCameraMount = 2;
                }
                else if (nextCameraMount >= 35) {
                    nextCameraMount = 1;
                }
                else if (nextCameraMount >= 0) {
                    nextCameraMount = 0;
                }
            }
            // ..
            if (nextCameraMount === this.currentMount) {
                nextCameraMount = parseInt(BABYLON.Scalar.RandomRange(0, 100).toFixed(0));
                if (nextCameraMount >= 70) {
                    nextCameraMount = 2;
                }
                else if (nextCameraMount >= 35) {
                    nextCameraMount = 1;
                }
                else if (nextCameraMount >= 0) {
                    nextCameraMount = 0;
                }
            }
            // ..
            if (nextCameraMount === this.currentMount) {
                nextCameraMount = (this.currentMount + 1);
            }
            // ..
            if (updateMount !== 0) {
                this.currentMount = (updateMount === 99) ? nextCameraMount : (this.currentMount + updateMount);
                if (this.currentMount < 0)
                    this.currentMount = 2;
                else if (this.currentMount > 2)
                    this.currentMount = 0;
            }
        }
        updateCameraPosition() {
            if (this.syncCameraTransform != null && this.currentMount > 0) {
                const deltaTime = this.getDeltaSeconds();
                // ..
                // Setup Camera Mount
                // ..
                let positionOffset = 20.0;
                let positionSpeed = 4.0;
                let rotationSpeed = 2.0;
                let lookAtVehicle = false;
                let smoothMovement = false;
                if (this.currentMount === 2) { // Front Facing View
                    if (this.frontCamera != null) {
                        positionOffset = this.frontCamera.positionOffset;
                        positionSpeed = this.frontCamera.positionSpeed;
                        rotationSpeed = this.frontCamera.rotationSpeed;
                        lookAtVehicle = this.frontCamera.lookAtVehicle;
                        smoothMovement = this.frontCamera.smoothSpeeds;
                    }
                }
                else if (this.currentMount === 1) { // Rear Facing View
                    if (this.rearCamera != null) {
                        positionOffset = this.rearCamera.positionOffset;
                        positionSpeed = this.rearCamera.positionSpeed;
                        rotationSpeed = this.rearCamera.rotationSpeed;
                        lookAtVehicle = this.rearCamera.lookAtVehicle;
                        smoothMovement = this.rearCamera.smoothSpeeds;
                    }
                }
                // ..
                // Update Camera Position
                // ..
                if (smoothMovement === true) {
                    // DEPRECATED: BABYLON.Vector3.LerpToRef(this.transform.position, this.syncCameraTransform.absolutePosition, (positionSpeed * deltaTime), this.transform.position);
                    let normalizedSpeed = 0;
                    let forwardSpeed = 0;
                    let scaledOffset = (this.currentMount === 2) ? (positionOffset + PROJECT.Camera_BigScreens.FRONT_CAMERA_PADDING) : (positionOffset + PROJECT.Camera_BigScreens.REAR_CAMERA_PADDING);
                    if (this.focusPlayerVehicle != null && this.focusPlayerVehicle.metadata != null && this.focusPlayerVehicle.metadata.car != null) {
                        if (this.focusPlayerVehicle.metadata.car.forwardSpeed != null) {
                            forwardSpeed = this.focusPlayerVehicle.metadata.car.forwardSpeed;
                        }
                        if (this.focusPlayerVehicle.metadata.car.normalizedSpeed != null) {
                            normalizedSpeed = this.focusPlayerVehicle.metadata.car.normalizedSpeed;
                        }
                    }
                    scaledOffset = BABYLON.Scalar.Lerp(0, scaledOffset, normalizedSpeed);
                    if (this.currentMount === 2) { // Front Facing View
                        scaledOffset = (forwardSpeed > 0) ? -scaledOffset : (scaledOffset * 0.5); // Note: Half Power On Reverse
                    }
                    else if (this.currentMount === 1) { // Rear Facing View
                        scaledOffset = (forwardSpeed > 0) ? scaledOffset : -(scaledOffset * 2.0); // Note: Double Power On Reverse
                    }
                    this.positionOffsetBuffer.set(0, 0, scaledOffset);
                    UNITY.Utilities.GetAbsolutePositionToRef(this.syncCameraTransform, this.positionVectorBuffer, this.positionOffsetBuffer);
                    BABYLON.Vector3.LerpToRef(this.transform.position, this.positionVectorBuffer, (positionSpeed * deltaTime), this.transform.position);
                }
                else {
                    this.transform.position.copyFrom(this.syncCameraTransform.absolutePosition);
                }
                // ..
                // Update Camera Rotation
                // ..
                if (lookAtVehicle === true && this.focusPlayerVehicle != null) {
                    const lookAtTransform = (this.lookCameraTransform != null) ? this.lookCameraTransform : this.focusPlayerVehicle;
                    lookAtTransform.absolutePosition.subtractToRef(this.transform.absolutePosition, this.relativePositionBuffer);
                    UNITY.Utilities.LookRotationToRef(this.relativePositionBuffer, this.relativeRotationBuffer);
                    if (smoothMovement === true) {
                        BABYLON.Quaternion.SlerpToRef(this.transform.rotationQuaternion, this.relativeRotationBuffer, (rotationSpeed * deltaTime), this.transform.rotationQuaternion);
                    }
                    else {
                        this.transform.rotationQuaternion.copyFrom(this.relativeRotationBuffer);
                    }
                }
                else {
                    if (smoothMovement === true) {
                        BABYLON.Quaternion.SlerpToRef(this.transform.rotationQuaternion, this.syncCameraTransform.absoluteRotationQuaternion, (rotationSpeed * deltaTime), this.transform.rotationQuaternion);
                    }
                    else {
                        this.transform.rotationQuaternion.copyFrom(this.syncCameraTransform.absoluteRotationQuaternion);
                    }
                }
            }
        }
        switchCameraLocation(updatePlayer = 1, updateMount = 99) {
            this.timer = 0; // Note: Must Reset Update Timer
            this.syncCameraTransform = null;
            this.lookCameraTransform = null;
            if (this.setFixedLocations === false) {
                const registeredVehicles = PROJECT.RaceTrackManager.GetPlayerVehicles();
                if (registeredVehicles != null && registeredVehicles.length > 0) {
                    this.updateCurrentPlayer(updatePlayer); // Note: Set Next Current Focus Player
                    this.updateCurrentMount(updateMount); // Note: Set Next Current Focus Mount
                    this.focusPlayerVehicle = registeredVehicles[this.currentPlayer];
                }
                if (this.focusPlayerVehicle == null)
                    this.focusPlayerVehicle = this.player;
                if (this.focusPlayerVehicle != null) {
                    this.setPlayerFocusCameraMount();
                }
                else {
                    this.setFixedCameraLocation(updatePlayer);
                }
            }
            else {
                this.setFixedCameraLocation(updatePlayer);
            }
        }
        setFixedCameraLocation(updatePoint = 1) {
            if (this.points != null && this.points.length > 0) {
                this.updateCurrentPoint(updatePoint); // Note: Set Next Fixed Track Camera Point
                const point = this.points[this.currentPoint];
                if (point != null) {
                    // DEPRECATED: if (this.transform.parent != null) this.transform.parent = null;
                    // DEPRECATED: this.transform.position.copyFrom(point.absolutePosition);
                    // DEPRECATED: this.transform.rotationQuaternion.copyFrom(point.absoluteRotationQuaternion);
                    // DEPRECATED: this.syncCameraTransform = point;
                    if (this.transform.parent != point)
                        this.transform.parent = point;
                    this.transform.position.set(0, 0, 0);
                    this.transform.rotationQuaternion.set(0, 0, 0, 1);
                    this.syncCameraTransform = null;
                    this.lookCameraTransform = null;
                }
            }
        }
        setCameraClosestToPlayer() {
            if (this.points != null && this.points.length > 0) {
                const closest = this.getCameraClosestToPlayer(this.focusPlayerVehicle);
                const distance = this.getDistanceToClosestCamera(this.focusPlayerVehicle, closest);
                const point = this.points[closest];
                if (point != null) {
                    // DEPRECATED: if (this.transform.parent != null) this.transform.parent = null;
                    // DEPRECATED: this.transform.position.copyFrom(point.absolutePosition);
                    // DEPRECATED: this.transform.rotationQuaternion.copyFrom(point.absoluteRotationQuaternion);
                    // DEPRECATED: this.syncCameraTransform = point;
                    if (this.transform.parent != point)
                        this.transform.parent = point;
                    this.transform.position.set(0, 0, 0);
                    this.transform.rotationQuaternion.set(0, 0, 0, 1);
                    this.syncCameraTransform = null;
                    this.lookCameraTransform = null;
                }
            }
        }
        setPlayerFocusCameraMount() {
            if (this.focusPlayerVehicle != null) {
                let mount = "DriverCameraMount";
                if (this.currentMount === 2) {
                    mount = "FrontCameraMount";
                }
                else if (this.currentMount === 1) {
                    mount = "RearCameraMount";
                }
                let focusCameraMount = UNITY.SceneManager.FindChildTransformNode(this.focusPlayerVehicle, mount, UNITY.SearchType.ExactMatch, false);
                if (focusCameraMount != null) {
                    if (this.currentMount === 0) {
                        if (this.transform.parent != focusCameraMount)
                            this.transform.parent = focusCameraMount;
                        this.transform.position.set(0, 0, 0);
                        this.transform.rotationQuaternion.set(0, 0, 0, 1);
                        this.syncCameraTransform = null;
                        this.lookCameraTransform = null;
                    }
                    else {
                        if (this.transform.parent != null)
                            this.transform.parent = null;
                        this.transform.position.copyFrom(focusCameraMount.absolutePosition);
                        this.transform.rotationQuaternion.copyFrom(focusCameraMount.absoluteRotationQuaternion);
                        this.syncCameraTransform = focusCameraMount;
                        this.lookCameraTransform = UNITY.SceneManager.FindChildTransformNode(this.focusPlayerVehicle, "LookAtCameraMount", UNITY.SearchType.ExactMatch, false);
                    }
                }
                else {
                    this.setCameraClosestToPlayer();
                }
            }
        }
        getCameraClosestToPlayer(player) {
            let result = 0;
            let points = (this.points != null) ? this.points.length : 0;
            if (points > 0) {
                let _distance = 10000;
                let _d = 0;
                for (let i = 0; i < points; i++) {
                    _d = BABYLON.Vector3.Distance(this.points[i].position, player.position);
                    if (_distance > _d) {
                        _distance = _d;
                        result = i;
                    }
                }
            }
            return result;
        }
        getDistanceToClosestCamera(player, camera) {
            return (this.points != null && this.points.length < camera) ? BABYLON.Vector3.Distance(this.points[camera].position, player.position) : 0;
        }
        getTransformNodesWithName(scene, name) {
            let result = null;
            if (scene.transformNodes != null) {
                scene.transformNodes.forEach((node) => {
                    if (node.name === name) {
                        if (result == null)
                            result = [];
                        result.push(node);
                    }
                });
            }
            if (scene.meshes != null) {
                scene.meshes.forEach((mesh) => {
                    if (mesh.name === name) {
                        if (result == null)
                            result = [];
                        result.push(mesh);
                    }
                });
            }
            return result;
        }
    }
    Camera_BigScreens._StaticInstance = null;
    Camera_BigScreens.FRONT_CAMERA_PADDING = 8;
    Camera_BigScreens.REAR_CAMERA_PADDING = 4;
    Camera_BigScreens.RTT_RATIO = 0;
    PROJECT.Camera_BigScreens = Camera_BigScreens;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class SpectatorCameraView
    */
    class SpectatorCameraView extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this.attachPlayerCamera = true;
            this.autoSwitchCameras = true;
        }
        // TODO: Implement Spectator UI With Selected Car Info
        awake() {
            this.initSpectatorView();
        }
        start() {
            /* Start component function */
        }
        fixed() {
            /* Fixed update loop function */
        }
        update() {
            /* Update render loop function */
        }
        late() {
            /* Late update render loop function */
        }
        after() {
            /* After update render loop function */
        }
        ready() {
            this.startSpectatorView();
        }
        destroy() {
            /* Destroy component function */
        }
        initSpectatorView() {
            UNITY.InputController.OnKeyboardPress(UNITY.UserInputKey.T, () => {
                //if (this.attachPlayerCamera === true && PROJECT.Camera_BigScreens.Instance != null) {
                PROJECT.Camera_BigScreens.Instance.AutoSwitchCamera = !PROJECT.Camera_BigScreens.Instance.AutoSwitchCamera;
                //}
            });
            UNITY.InputController.OnKeyboardPress(UNITY.UserInputKey.UpArrow, () => {
                //if (this.attachPlayerCamera === true && PROJECT.Camera_BigScreens.Instance != null) {
                PROJECT.Camera_BigScreens.Instance.AutoSwitchCamera = false;
                PROJECT.Camera_BigScreens.Instance.SwitchActiveView(-1, 0);
                //}
            });
            UNITY.InputController.OnKeyboardPress(UNITY.UserInputKey.DownArrow, () => {
                //if (this.attachPlayerCamera === true && PROJECT.Camera_BigScreens.Instance != null) {
                PROJECT.Camera_BigScreens.Instance.AutoSwitchCamera = false;
                PROJECT.Camera_BigScreens.Instance.SwitchActiveView(+1, 0);
                //}
            });
            UNITY.InputController.OnKeyboardPress(UNITY.UserInputKey.LeftArrow, () => {
                //if (this.attachPlayerCamera === true && PROJECT.Camera_BigScreens.Instance != null) {
                PROJECT.Camera_BigScreens.Instance.AutoSwitchCamera = false;
                PROJECT.Camera_BigScreens.Instance.SwitchActiveView(0, -1);
                //}
            });
            UNITY.InputController.OnKeyboardPress(UNITY.UserInputKey.RightArrow, () => {
                //if (this.attachPlayerCamera === true && PROJECT.Camera_BigScreens.Instance != null) {
                PROJECT.Camera_BigScreens.Instance.AutoSwitchCamera = false;
                PROJECT.Camera_BigScreens.Instance.SwitchActiveView(0, +1);
                //}
            });
        }
        startSpectatorView() {
            if (PROJECT.Camera_BigScreens.Instance != null) {
                PROJECT.Camera_BigScreens.Instance.AutoSwitchCamera = this.autoSwitchCameras;
                if (this.attachPlayerCamera === true)
                    PROJECT.Camera_BigScreens.Instance.ActivatePlayerCamera();
            }
        }
    }
    PROJECT.SpectatorCameraView = SpectatorCameraView;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Shader Material
    * @class VertexSplat
    */
    class VertexSplat extends UNITY.UniversalAlbedoMaterial {
        constructor(name, scene) {
            super(name, scene);
            this.enableTime = false;
            this.enableShaderChunks = true;
        }
        getShaderName() {
            return "pbr";
        }
        getShaderChunk() {
            return "VertexSplat";
        }
        getCustomAttributes() {
            return null; // Optional: Custom Attributes
        }
        updateShaderChunks() {
            // Optional: Update Material Shader Chunks
        }
        ////////////////////////////////////////////////
        // Albedo Material Life Cycle Functions       //
        ////////////////////////////////////////////////
        awake() {
            /* Init material function */
        }
        after() {
            /* After bind update function */
        }
    }
    PROJECT.VertexSplat = VertexSplat;
    BABYLON.RegisterClass("PROJECT.VertexSplat", VertexSplat);
})(PROJECT || (PROJECT = {}));
var UNITY;
(function (UNITY) {
    /**
     * Babylon character controller pro class (Unity Style Character Controller System)
     * @class CharacterController - All rights reserved (c) 2020 Mackey Kinard
     */
    class CharacterController extends UNITY.ScriptComponent {
        constructor() {
            super(...arguments);
            this._abstractMesh = null;
            this._avatarRadius = 0.5;
            this._avatarHeight = 2;
            this._centerOffset = new BABYLON.Vector3(0, 0, 0);
            this._slopeLimit = 45;
            this._skinWidth = 0.08;
            this._stepOffset = 0.3; // See https://discourse.threejs.org/t/ammo-js-with-three-js/12530/47 (Works Best With 0.535 and Box Or Cylinder Shape - ???)
            this._capsuleSegments = 16;
            this._minMoveDistance = 0.001;
            this._isPhysicsReady = false;
            this._maxCollisions = 4;
            this._createCylinderShape = false;
            this._movementVelocity = new BABYLON.Vector3(0, 0, 0);
            this._tmpPositionBuffer = new BABYLON.Vector3(0, 0, 0);
            this.updatePosition = true;
            this.syncGhostToTransform = true;
        }
        preCreateCylinderShape() { this._createCylinderShape = true; }
        //public getInternalCharacter():any { return this.m_character; }
        //public getCollisionShape():any { return this.m_ghostShape; }
        getAvatarRadius() { return this._avatarRadius; }
        getAvatarHeight() { return this._avatarHeight; }
        getSkinWidth() { return this._skinWidth; }
        getStepOffset() { return this._stepOffset; }
        getCenterOffset() { return this._centerOffset; }
        //public getCapsuleSize():BABYLON.Vector3 { return this.m_capsuleSize; }
        getMinMoveDistance() { return this._minMoveDistance; }
        setMinMoveDistance(distance) { this._minMoveDistance = distance; }
        getVerticalVelocity() { return 0; } // Note: Toolkit Addon Function
        getAddedMargin() { return 0; } // Note: Toolkit Addon Function
        setAddedMargin(margin) { } // Note: Toolkit Addon Function
        setMaxJumpHeight(maxJumpHeight) { }
        setFallingSpeed(fallSpeed) { }
        getSlopeLimit() { return 0; }
        setSlopeLimit(slopeRadians) { }
        setUpAxis(axis) { }
        getGravity() { return 0; }
        setGravity(gravity) { }
        isGrounded() { return false; }
        isReady() { return false; }
        canJump() { return false; }
        syncMovementState() {
            if (this._isPhysicsReady === true) {
                //this.m_ghostTransform = this.m_ghostObject.getWorldTransform();
                //if (this.m_ghostTransform != null) {
                //    this.m_ghostPosition = this.m_ghostTransform.getOrigin();
                //} else {
                //    this.m_ghostPosition = null;
                //}
            }
            this.scene.getPhysicsEngine();
        }
        syncTransformToGhostPosition() {
            if (this._isPhysicsReady === true) {
                //if (this.m_ghostPosition != null) {
                //    this.m_characterPosition.set(this.m_ghostPosition.x(), this.m_ghostPosition.y(), this.m_ghostPosition.z());
                //    if (this.transform.parent != null) UNITY.Utilities.InverseTransformDirectionToRef((this.transform.parent as BABYLON.TransformNode), this.m_characterPosition, this.m_characterPosition);
                //    if (this._centerOffset != null) {
                //        // Note: Subtract Character Controller Center Offset
                //        this.m_characterPosition.subtractInPlace(this._centerOffset); 
                //    }
                //    this.transform.position.copyFrom(this.m_characterPosition);
                //}
            }
        }
        syncGhostToTransformPosition() {
            if (this._isPhysicsReady === true) {
                //this.m_characterPosition.copyFrom(this.transform.position);
                //if (this._centerOffset != null) {
                //    // Note: Add Character Controller Center Offset
                //    this.m_characterPosition.addInPlace(this._centerOffset); 
                //}
                //if (this.transform.parent != null) UNITY.Utilities.TransformDirectionToRef((this.transform.parent as BABYLON.TransformNode), this.m_characterPosition, this.m_characterPosition);
                //this.setGhostWorldPosition(this.m_characterPosition);
            }
        }
        setGhostCollisionState(collision) {
            if (collision === true) {
                //this.m_ghostObject.setCollisionFlags(BABYLON.CollisionFlags.CF_CHARACTER_OBJECT);
            }
            else {
                //this.m_ghostObject.setCollisionFlags(BABYLON.CollisionFlags.CF_NO_CONTACT_RESPONSE);
            }
        }
        ////////////////////////////////////////////////////
        // Public Character Controller Movement Functions //
        ////////////////////////////////////////////////////
        /** Sets the kinematic character position to the specified location. */
        set(x, y, z) {
            /*
            this._tmpPositionBuffer.set(x,y,z);
            this.setGhostWorldPosition(this._tmpPositionBuffer);
            */
        }
        /** Translates the kinematic character with the specfied velocity. */
        move(velocity) {
            if (velocity != null) {
                /*
                this.m_moveDeltaX = velocity.x;
                this.m_moveDeltaZ = velocity.z;
                if (Math.abs(velocity.x) < this._minMoveDistance) {
                    if (velocity.x > 0) {
                        this.m_moveDeltaX = this._minMoveDistance;
                    } else if (velocity.x < 0) {
                        this.m_moveDeltaX = -this._minMoveDistance;
                    }
                }
                if (Math.abs(velocity.z) < this._minMoveDistance) {
                    if (velocity.z > 0) {
                        this.m_moveDeltaZ = this._minMoveDistance;
                    } else if (velocity.z < 0) {
                        this.m_moveDeltaZ = -this._minMoveDistance;
                    }
                }
                if (this.m_walkDirection != null) {
                    this._movementVelocity.set(this.m_moveDeltaX, 0, this.m_moveDeltaZ);
                    this.m_walkDirection.setValue(this._movementVelocity.x, this._movementVelocity.y, this._movementVelocity.z);
                    this.internalSetWalkDirection(this.m_walkDirection);
                }
                */
            }
        }
        /** Jumps the kinematic chacracter with the specified speed. */
        jump(speed) {
            /*
            if (this.canJump()) {
                this.internalSetJumpSpeed(speed);
                this.internalJump();
            }
            */
        }
        /** Warps the kinematic chacracter to the specified position. */
        warp(position) {
            /*
            if (this.m_warpPosition != null) {
                this.m_warpPosition.setValue(position.x, position.y, position.z);
                this.internalWarp(this.m_warpPosition);
            }
            */
        }
    }
    UNITY.CharacterController = CharacterController;
})(UNITY || (UNITY = {}));

// Project Shader Chunks
BABYLON.Effect.ShadersStore["VertexSplatShaderChunks"] = {};
BABYLON.Effect.ShadersStore["VertexSplatShaderChunks"].VertexDefinitions = window.atob("I2lmZGVmIFNQTEFUMwp2YXJ5aW5nIHZlYzIgU3BsYXQzVVY7CnVuaWZvcm0gdmVjMiBTcGxhdDNJbmZvczsKdW5pZm9ybSBtYXQ0IFNwbGF0M01hdHJpeDsKI2VuZGlmCg==");
BABYLON.Effect.ShadersStore["VertexSplatShaderChunks"].VertexMainEnd = window.atob("CSNpZmRlZiBTUExBVDMKCQlpZiAoU3BsYXQzSW5mb3MueCA9PSAwLikKCQl7CgkJCVNwbGF0M1VWID0gdmVjMihTcGxhdDNNYXRyaXggKiB2ZWM0KHV2LCAxLjAsIDAuMCkpOwoJCX0KCQllbHNlCgkJewoJCQlTcGxhdDNVViA9IHZlYzIoU3BsYXQzTWF0cml4ICogdmVjNCh1djIsIDEuMCwgMC4wKSk7CgkJfQoJI2VuZGlmCg==");
BABYLON.Effect.ShadersStore["VertexSplatShaderChunks"].FragmentDefinitions = window.atob("dW5pZm9ybSBmbG9hdCBnYW1lVGltZTsgICAgIC8vIEJhYnlsb24gVG9vbGtpdCBVbml2ZXJzYWwgU2hhZGVyIE1hdGVyaWFsCnVuaWZvcm0gZmxvYXQgZGVsdGFUaW1lOyAgICAvLyBCYWJ5bG9uIFRvb2xraXQgVW5pdmVyc2FsIFNoYWRlciBNYXRlcmlhbAp1bmlmb3JtIGZsb2F0IEludGVuc2l0eUE7CnVuaWZvcm0gdmVjNCBDb2xvckM7CiNpZmRlZiBTUExBVDMKdW5pZm9ybSBzYW1wbGVyMkQgU3BsYXQzOwp2YXJ5aW5nIHZlYzIgU3BsYXQzVVY7CiNlbmRpZgp1bmlmb3JtIGZsb2F0IEludGVuc2l0eUM7Cg==");
BABYLON.Effect.ShadersStore["VertexSplatShaderChunks"].FragmentUpdateAlbedo = window.atob("ICAgIHN1cmZhY2VBbGJlZG8gPSB2QWxiZWRvQ29sb3IucmdiOwogICAgYWxwaGEgPSB2QWxiZWRvQ29sb3IuYTsKCiAgICAjaWZkZWYgQUxCRURPCiAgICAgICAgI2lmIGRlZmluZWQoQUxQSEFGUk9NQUxCRURPKSB8fCBkZWZpbmVkKEFMUEhBVEVTVCkKICAgICAgICAgICAgYWxwaGEgKj0gYWxiZWRvVGV4dHVyZS5hOwogICAgICAgICNlbmRpZgoKICAgICAgICAjaWZkZWYgR0FNTUFBTEJFRE8KICAgICAgICAgICAgc3VyZmFjZUFsYmVkbyAqPSB0b0xpbmVhclNwYWNlKGFsYmVkb1RleHR1cmUucmdiKTsKICAgICAgICAjZWxzZQogICAgICAgICAgICBzdXJmYWNlQWxiZWRvICo9IGFsYmVkb1RleHR1cmUucmdiOwogICAgICAgICNlbmRpZgoKICAgICAgICBzdXJmYWNlQWxiZWRvICo9IGFsYmVkb0luZm9zLnk7CiAgICAjZW5kaWYKCiAgICAjaWYgZGVmaW5lZChWRVJURVhDT0xPUikgfHwgZGVmaW5lZChJTlNUQU5DRVNDT0xPUikgJiYgZGVmaW5lZChJTlNUQU5DRVMpCiAgICAgICAgI2lmZGVmIFNQTEFUMwoJCSAgICB2ZWMzIHNwbGF0MSA9IHN1cmZhY2VBbGJlZG8ucmdiICogSW50ZW5zaXR5QTsKCQkgICAgdmVjNCBzcGxhdDMgPSB0ZXh0dXJlMkQoU3BsYXQzLCBTcGxhdDNVVikgKiBDb2xvckMgKiBJbnRlbnNpdHlDOwogICAgICAgICAgICBzdXJmYWNlQWxiZWRvLnJnYiA9IG1peChzcGxhdDMucmdiLCBzcGxhdDEucmdiLCB2Q29sb3IuYik7CiAgICAgICAgI2Vsc2UKICAgICAgICAgICAgc3VyZmFjZUFsYmVkbyAqPSB2Q29sb3IucmdiOwogICAgICAgICNlbmRpZgogICAgI2VuZGlmCgogICAgI2lmZGVmIERFVEFJTAogICAgICAgIGZsb2F0IGRldGFpbEFsYmVkbzIgPSAyLjAgKiBtaXgoMC41LCBkZXRhaWxDb2xvci5yLCB2RGV0YWlsSW5mb3MueSk7CiAgICAgICAgc3VyZmFjZUFsYmVkby5yZ2IgPSBzdXJmYWNlQWxiZWRvLnJnYiAqIGRldGFpbEFsYmVkbzIgKiBkZXRhaWxBbGJlZG8yOyAvLyBzaG91bGQgYmUgcG93KGRldGFpbEFsYmVkbywgMi4yKSBidXQgZGV0YWlsQWxiZWRvwrIgaXMgY2xvc2UgZW5vdWdoIGFuZCBjaGVhcGVyIHRvIGNvbXB1dGUKICAgICNlbmRpZgo=");

