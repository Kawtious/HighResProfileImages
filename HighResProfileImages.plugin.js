/**
 * @name High-Res Profile Images
 * @version 1.0.2
 * @author Z'ark Ashveil
 * @authorId 262113677900120065
 * @authorLink https://github.com/Kawtious
 * @description Replaces user avatars with higher resolution images
 * @source https://github.com/Kawtious/HighResProfileImages
 * @updateUrl https://raw.githubusercontent.com/Kawtious/HighResProfileImages/main/HighResProfileImages.plugin.js
 */

module.exports = class HighResProfileImages {
    PLUGIN_ID = "HighResProfileImages";

    VALID_SIZES = [
        256,
        512,
        1024,
        2048,
        4096
    ]

    DEFAULT_SETTINGS = {
        resSize: this.VALID_SIZES[0]
    }

    constructor() {
        this.settings = BdApi.Data.load(this.PLUGIN_ID, "settings");

        if (!this.settings) {
            this.settings = this.DEFAULT_SETTINGS;
            BdApi.Data.save(this.PLUGIN_ID, "settings", this.settings);
        }
    }

    start() {
        BdApi.Patcher.after(
            this.PLUGIN_ID,
            BdApi.Webpack.getModule(m => m?.getUserAvatarURL),
            "getUserAvatarURL",
            (_, __, res) => this.replaceSizeParam(res, this.settings.resSize)
        );
    }

    stop() {
        BdApi.Patcher.unpatchAll(this.PLUGIN_ID);
    }

    getSettingsPanel() {
        const resSize = {
            id: "resSize",
            name: "Resolution Size",
            note: "Warning: The higher the value, the more resources will be used",
            type: "dropdown",
            value: this.settings.resSize,
            options: this.VALID_SIZES.map(size => { return { label: size, value: size } })
        };

        return BdApi.UI.buildSettingsPanel({
            settings: [resSize],
            onChange: (_, id, value) => {
                this.settings[id] = value;
                BdApi.Data.save(this.PLUGIN_ID, "settings", this.settings);
            }
        });
    }

    replaceSizeParam(url, size) {
        if (!url || typeof url !== "string") return url;

        if (!this.VALID_SIZES.includes(size)) return url;

        if (!/[?&]size=/.test(url))
            return url + (url.includes("?") ? "&" : "?") + `size=${size}`;

        return url.replace(/([?&])size=\d+/g, `$1size=${size}`);
    }
};
