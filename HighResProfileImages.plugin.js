/**
 * @name High-Res Profile Images
 * @version 1.0.0
 * @author Z'ark Ashveil
 * @authorId 262113677900120065
 * @authorLink https://github.com/Kawtious
 * @description Replaces user avatars with higher resolution images
 * @source https://github.com/Kawtious/HighResProfileImages
 * @updateUrl https://raw.githubusercontent.com/Kawtious/HighResProfileImages/main/HighResProfileImages.plugin.js
 */

const PLUGIN_ID = "HighResProfileImages";

const VALID_SIZES = [
    256,
    512,
    1024,
    2048,
    4096
]

const DEFAULT_SETTINGS = {
    resSize: VALID_SIZES[0]
}

module.exports = class HighResProfileImages {
    constructor() {
        this.settings = BdApi.Data.load(PLUGIN_ID, "settings");

        if (!this.settings) {
            this.settings = DEFAULT_SETTINGS;
            BdApi.Data.save(PLUGIN_ID, "settings", this.settings);
        }
    }

    start() {
        BdApi.Patcher.after(
            PLUGIN_ID,
            BdApi.Webpack.getModule(m => m?.getUserAvatarURL),
            "getUserAvatarURL",
            (_, __, res) => this.replaceSizeParam(res, this.settings.resSize)
        );
    }

    stop() {
        BdApi.Patcher.unpatchAll(PLUGIN_ID);
    }

    getSettingsPanel() {
        const loadWarning = "Warning: The higher the value, the more resources will be used";

        const sizeOptions = VALID_SIZES.map(size => { return { label: size, value: size } })

        const resSize = {
            id: "resSize",
            name: "Resolution Size",
            note: loadWarning,
            type: "dropdown",
            value: this.settings.resSize,
            options: sizeOptions
        };

        return BdApi.UI.buildSettingsPanel({
            settings: [resSize],
            onChange: (_, id, value) => {
                this.settings[id] = value;
                BdApi.Data.save(PLUGIN_ID, "settings", this.settings);
            }
        });
    }

    replaceSizeParam(url, size) {
        if (!url || typeof url !== "string") return url;

        if (!VALID_SIZES.includes(size)) return url;

        if (!/[?&]size=/.test(url))
            return url + (url.includes("?") ? "&" : "?") + `size=${size}`;

        return url.replace(/([?&])size=\d+/g, `$1size=${size}`);
    }
};
