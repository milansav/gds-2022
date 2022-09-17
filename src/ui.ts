const nFormatter = (num: number) => {

    let digits: number = 0;

    if(num < 1000)
        digits = 0;
    else
        digits = 1;

    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "K" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "G" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" }
    ]

    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
    const item = lookup.slice().reverse().find((item) => {
        return num >= item.value
    })
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0"
}

const houseData: {
    [key: string]: {
        price: number,
            description: string
    }
} = {
    'NONE': {
        price: 0,
        description: 'It is nothing'
    },
    'EMPTY': {
        price: 0,
        description: 'It is nothing'
    },
    'LAND': {
        price: 200,
        description: 'Gives you somewhere to build on'
    },
    'HOUSE': {
        price: 500,
        description: 'Abrakadabra'
    },
    'BANK': {
        price: 2000,
        description: 'Abrakadabra'
    },
    'WINDMILL': {
        price: 500,
        description: 'Gives you money'
    },
    'PORT': {
        price: 4000,
        description: 'Wasted one space, in return gives you money'
    },
    'WINDBLOWER': {
        price: 5000,
        description: 'Shields you from storms'
    },
    'ELEVATOR': {
        price: 1500,
        description: 'Gets you up high'
    },
    'FARM': {
        price: 1000,
        description: 'Gives you money'
    },
};

class UI extends pc.ScriptType {

    css: pc.Asset;
    html: pc.Asset;
    div: HTMLDivElement;

    gameState: GameData;

    actions = {
        'purchase-land': function () {

        }.bind(this),
        'get-money': function (this: UI, money: number) {
            const text = `Money: ${nFormatter(money)}`;
            (this.div.querySelector('[plc-value-money]')! as HTMLParagraphElement).innerText = text;
        }.bind(this),
        'select-housetype': function (this: UI, houseType: string) {
            this.app.fire('event-update-game-state-housetype', houseType);
        }.bind(this),
        'set-currently-selected': function (this: UI, selected: string) {
            let costMessage = `Cost ${houseData[selected].price}`;
            if(houseData[selected].price > this.gameState.money)
                costMessage = `Cost ${houseData[selected].price} - NOT ENOUGH`;
            (this.div.querySelector('[plc-value-house-cost]')! as HTMLParagraphElement).innerText = costMessage;
            (this.div.querySelector('[plc-value-house-description]') as HTMLParagraphElement).innerText = `${houseData[selected].description}`;
            if (selected === 'EMPTY')
                selected = 'NONE';
            (this.div.querySelector('[plc-value-currentlySelected]')! as HTMLParagraphElement).innerText = `${selected.charAt(0) + selected.substring(1).toLowerCase()}`;
        }.bind(this),

    };

    initialize() {
        const style = document.createElement('style');

        document.head.appendChild(style);

        style.innerHTML = this.css.resource || '';

        this.div = document.createElement('div');
        this.div.classList.add('container');
        this.div.innerHTML = this.html.resource || '';

        const touchscreen = this.div.querySelector("div.touchscreen")!;

        touchscreen.addEventListener("mousemove", function (this: UI, event: Event) {
            this.app.fire('event-screen-move', event);
        }.bind(this));

        touchscreen.addEventListener("click", function (this: UI, event: Event) {
            this.app.fire('event-screen-down', event);
        }.bind(this));

        const buttons = this.div.querySelectorAll('[plc-select-housetype]');

        buttons.forEach(button => {
            const houseType = button.getAttribute('plc-select-housetype') || 'EMPTY';
            button.addEventListener('click', () => this.actions["select-housetype"](houseType));
        })

        console.log(buttons);

        document.body.appendChild(this.div);

        this.app.on('event-game-state-updated', this.handleUpdateUIToMatchState, this);
    }

    handleUpdateUIToMatchState(gameState: GameData) {
        this.gameState = gameState;
        this.handleUpdateMoney(gameState.money);
        this.handleUpdateCurrentlySelected(gameState.houseType);
    }

    handleUpdateMoney(newMoney: number) {
        this.actions["get-money"](newMoney);
    }

    handleUpdateCurrentlySelected(newCurrentlySelected: string) {
        this.actions["set-currently-selected"](newCurrentlySelected);
    }
}

pc.registerScript(UI, 'ui');

UI.attributes.add('css', {type: 'asset', assetType: 'css', title: 'CSS Asset'});
UI.attributes.add('html', {type: 'asset', assetType: 'html', title: 'HTML Asset'});