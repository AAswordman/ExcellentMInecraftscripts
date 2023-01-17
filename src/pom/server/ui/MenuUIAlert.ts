import PomClient from "../PomClient.js";
import ExActionAlert from "../../../modules/exmc/server/ui/ExActionAlert.js";
import { to } from "../../../modules/exmc/server/ExErrorQueue.js";
import ExGameConfig from "../../../modules/exmc/server/ExGameConfig.js";
import ExGameClient from '../../../modules/exmc/server/ExGameClient.js';
import ExInterworkingPool from '../../../modules/exmc/interface/ExInterworkingPool.js';
export class MenuUIAlertView<T extends ExGameClient> {
    msg?: string;
    msgs?: string[];
    type!: "textWithBg" | "toggle" | "text_title" | "padding" | "button" | "text" | "buttonList2" | "buttonList3" | "img_adjustToScreen";
    state?: (client: T, ui: MenuUIAlert<T>, view: this) => boolean;
    function?: (client: T, ui: MenuUIAlert<T>, view: this) => boolean;
    buttons?: ((client: T, ui: MenuUIAlert<T>, view: this) => boolean)[];
}


export default class MenuUIAlert<T extends ExGameClient> {
    static getLabelViews<T extends ExGameClient>(msg: string[]): MenuUIAlertView<T>[] {
        let arr: MenuUIAlertView<T>[] = [];
        for (let i = 0; i < msg.length; i++) {
            arr.push({
                "type": "text",
                "msg": msg[i]
            });
        };
        return arr;
    }

    choose: string[] = [];
    private _uiJson: any;
    private _client: PomClient;

    constructor(client: PomClient, uiJson: MenuUIJson<T>) {
        this._uiJson = uiJson;
        this._client = client;
    }

    showPage(chs: string[]) {
        this.choose = chs;
        to(this.upDatePage());
    }
    async upDatePage() {
        let page = this._uiJson[this.choose[0]].page;
        if (typeof (page) == "function") {
            page = page(this._client, this);
        }
        let subpage = page[this.choose[1]];

        if (typeof (subpage) == "function") {
            subpage = subpage(this._client, this);
        }

        let alert = new ExActionAlert();
        alert.body(this.choose.join(" -> "));
        alert.title("__pomAlertMenu");
        for (let i in this._uiJson) {
            if (i == this.choose[0]) {
                alert.button("top1_d", () => { }, this._uiJson[i].img);
            } else {
                const id = i;
                alert.button("top1", () => {
                    //this._client.player.runCommand("title @s title Loading...");
                    this.choose[0] = id;
                    this.choose[1] = this._uiJson[this.choose[0]]["default"];
                    to(this.upDatePage());
                }, this._uiJson[i].img);
            }

        }
        for (let i in page) {
            let text;
            if (typeof (page[i]) == "function") {
                text = page[i](this._client, this).text;
            } else {
                text = page[i].text;
            }
            if (i == this.choose[1]) {
                alert.button("top2_d", () => { }, text);
            } else {
                const id = i;
                alert.button("top2", () => {
                    //this._client.player.runCommand("title @s title Loading...");
                    this.choose[1] = id;
                    to(this.upDatePage());
                }, text);
            }
        }
        let views = subpage.page;
        if (typeof (views) == "function") {
            views = views(this._client, this);
            let err: any;
            if (views instanceof Promise<MenuUIAlertView<T>>) {
                [views, err] = await to(views);
            }
        }

        for (const v of views) {
            switch (v.type) {
                case "toggle":
                    alert.button(v.type + "_" + (v.state(this._client, this) ? "on" : "off"), () => {
                        let res = v.function(this._client, this);
                        if (res) { to(this.upDatePage()); }
                    }, v.msg);
                    break;
                case "buttonList3":
                    alert.button(v.type + "_1", () => {
                        let res = v.buttons[0](this._client, this);
                        if (res) { to(this.upDatePage()); }
                    }, v.msgs[0]);
                    alert.button(v.type + "_2", () => {
                        let res = v.buttons[1](this._client, this);
                        if (res) { to(this.upDatePage()); }
                    }, v.msgs[1]);
                    alert.button(v.type + "_3", () => {
                        let res = v.buttons[2](this._client, this);
                        if (res) { to(this.upDatePage()); }
                    }, v.msgs[2]);
                    alert.button(v.type + "_4", () => {
                        let res = v.function(this._client, this);
                        if (res) { to(this.upDatePage()); }
                    }, " ");
                    break;
                default:
                    alert.button(v.type, () => {
                        let res = v.function(this._client, this);
                        if (res) { to(this.upDatePage()); }
                    }, v.msg);
                    break;
            }
        }
        alert.show(this._client.player);
    }
}

export interface MenuUIJson<T extends ExGameClient> {
    [x: string]: {
        img: string;
        text: string;
        default: string;
        page: {
            [x: string]: {
                text: string;
                page: MenuUIAlertView<T>[] | ((client: T, ui: MenuUIAlert<T>) => MenuUIAlertView<T>[]) |
                ((client: T, ui: MenuUIAlert<T>) => Promise<MenuUIAlertView<T>[]>);
            }
        }
    }
}