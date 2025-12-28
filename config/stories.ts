export const STORIES = {
    boot: {
        title: "The Boot",
        narrator: "UNCLE JACK CHARLES",
        description: "This boot was found in the debris... a remnant of a journey taken long ago.",
        model: "/assets/boot.high.glb",
        camera: "/assets/camera-animation__boot.glb",
        audio: "/assets/act3-boot.mp3",
        color: "#eecfa1", // Gold
        scale: 1.0
    },
    rifle: {
        title: "The Rifle",
        narrator: "UNCLE JACK CHARLES",
        description: "A standard issue rifle. Heavy with the weight of conflict.",
        model: "/assets/rifle.high.glb",
        camera: "/assets/camera-animation__rifle.glb",
        audio: "/assets/act3-rifle.mp3",
        color: "#a1cfee", // Blueish steel
        scale: 1.0
    },
    armor: {
        title: "The Armor",
        narrator: "WESLEY ENOCH",
        description: "Plate mail, dented and worn. A failed protection.",
        model: "/assets/helmet.high.glb", // Using helmet as proxy
        camera: "/assets/camera-animation__armour.glb",
        audio: "/assets/act3-armour.mp3",
        color: "#c0c0c0", // Silver
        scale: 1.2
    },
    mask: {
        title: "The Death Mask",
        narrator: "WESLEY ENOCH",
        description: "A visage of the departed. Silent and observing.",
        model: "/assets/deathmask.high.glb",
        camera: "/assets/camera-animation__mask.glb",
        audio: "/assets/act3-mask.mp3",
        color: "#ffaaaa", // Reddish
        scale: 0.8
    },
    letter: {
        title: "The Letter",
        narrator: "WESLEY ENOCH",
        description: "Words sent home, never to be read again.",
        model: "/assets/letter.viewer.glb",
        camera: "/assets/camera-animation__boot.glb",
        audio: "/assets/act3-letter.mp3",
        color: "#ffffff", // White paper
        scale: 0.5
    }
};

export type StoryKey = keyof typeof STORIES;
