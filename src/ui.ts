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
        price: 100,
        description: 'Gives you somewhere to build on'
    },
    'HOUSE': {
        price: 500,
        description: 'Gives you +15% income boost to all buildings'
    },
    'BANK': {
        price: 2000,
        description: 'Gives you 1600 cash per minute'
    },
    'WINDMILL': {
        price: 500,
        description: 'Gives you 800 cash per minute'
    },
    'PORT': {
        price: 4000,
        description: 'Gives you 2000 cash per minute'
    },
    'WINDBLOWER': {
        price: 300,
        description: 'Shields you from storms'
    },
    'ELEVATOR': {
        price: 1500,
        description: 'Gets you up high'
    },
    'FARM': {
        price: 1000,
        description: 'Gives you 1200 cash per minute'
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
            //@ts-ignore
            (this.div.querySelectorAll('[plc-value-house-description]')).forEach(node => node.innerText = `${houseData[selected].description}`);
            if (selected === 'EMPTY')
                selected = 'NONE';
            //@ts-ignore
            (this.div.querySelectorAll('[plc-value-currentlySelected]')).forEach(node => node.innerText = `${selected.charAt(0) + selected.substring(1).toLowerCase()}`);
        }.bind(this),
        'update-passive-boost': function (this: UI, value: number) {
            (this.div.querySelector('[plc-value-passiveBoost]')! as HTMLParagraphElement).innerText = `Passive boost: +${Math.round(value*100)-100}%`;
        }.bind(this),
        'house-action': function(this: UI, house: Building) {
            (this.div.querySelector('[plc-overlay-currentlySelected]') as HTMLHeadingElement).innerText = `${house.type.charAt(0) + house.type.substring(1).toLowerCase()}`;
            (this.div.querySelector('[plc-overlay-house-description]') as HTMLParagraphElement).innerText = houseData[house.type].description;
            (this.div.querySelector('.overlay') as Element).classList.remove('hidden');
            (this.div.querySelector('[plc-demolish-building]')! as HTMLButtonElement).addEventListener('click', () => {
                console.log(house.uuid);
                this.app.fire('event-demolish-building', house.uuid);
                this.handleCloseOverlay();
            });

            if(house.type === 'ELEVATOR') {
                const upButton = document.createElement('button');
                upButton.addEventListener('click', function(this: UI) {
                    this.app.fire('event-floor-up');
                    this.handleCloseOverlay();
                }.bind(this));
                upButton.innerText = 'Go Up';
                const downButton = document.createElement('button');
                downButton.addEventListener('click', function(this: UI) {
                    this.app.fire('event-floor-down');
                    this.handleCloseOverlay();
                }.bind(this));
                downButton.innerText = 'Go Down';
                const actionsRoot = this.div.querySelector('[plc-array-actionButtons]')!;
                if(this.gameState.floor > 0)
                    actionsRoot.appendChild(downButton);
                if(this.gameState.floor < 4)
                    actionsRoot.appendChild(upButton);
            }
        }.bind(this),
        'update-floor': function (this: UI, floor: number) {
            (this.div.querySelector('[plc-value-floor]') as HTMLParagraphElement).innerText = `Floor: ${floor}`;
        }.bind(this)

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

        const closeOverlayButton: Element = this.div.querySelector('[plc-close-overlay]')!;

        closeOverlayButton.addEventListener('click', this.handleCloseOverlay.bind(this));

        console.log(buttons);

        document.body.appendChild(this.div);

        this.app.on('event-game-state-updated', this.handleUpdateUIToMatchState, this);
        this.app.on('event-house-action', this.handleHouseAction, this);
    }

    handleUpdateUIToMatchState(gameState: GameData) {
        this.gameState = gameState;
        this.handleUpdateMoney(gameState.money);
        this.handleUpdateCurrentlySelected(gameState.houseType);
        this.handleUpdatePassiveBoost(gameState.boosters);
        this.handleUpdateFloor(gameState.floor);
    }

    handleUpdateFloor(floor: number) {
        this.actions["update-floor"](floor);
    }

    handleUpdatePassiveBoost(value: number) {
        this.actions["update-passive-boost"](value);
    }

    handleUpdateMoney(newMoney: number) {
        this.actions["get-money"](newMoney);
    }

    handleUpdateCurrentlySelected(newCurrentlySelected: string) {
        this.actions["set-currently-selected"](newCurrentlySelected);
    }

    handleHouseAction(house: Building) {
        this.actions["house-action"](house);
    }

    handleCloseOverlay() {
        (this.div.querySelector('.overlay') as Element).classList.add('hidden');
        const target = this.div.querySelector('[plc-array-actionButtons]')!;

        while(target.firstChild) {
            target.removeChild(target.lastChild!);
        }
    }
}

pc.registerScript(UI, 'ui');

UI.attributes.add('css', {type: 'asset', assetType: 'css', title: 'CSS Asset'});
UI.attributes.add('html', {type: 'asset', assetType: 'html', title: 'HTML Asset'});