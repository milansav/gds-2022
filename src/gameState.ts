type GameData = {
    money: number,
    floor: number,
    houseType: string,
    boosters: number,
    baseEarning: number, //Per minute
};

class GameState extends pc.ScriptType {
    data: GameData = {
        money: 3000,
        floor: 0,
        houseType: 'EMPTY',
        boosters: 1,
        baseEarning: 4000
    };

    initialize() {
        this.app.on('event-purchase', this.handlePurchase, this);
        this.app.on('force-state-update', this.forceUpdate, this);
        this.app.on('event-update-booster', this.handleUpdateBooster, this);
        this.app.on('event-earn-money', this.handleMoneyEarn, this);
        this.app.on('event-update-game-state', this.handleUpdateGameState, this);
        this.app.on('event-update-game-state-housetype', this.handleUpdateHouseType, this);
        this.app.fire('event-game-state-updated', this.data);
        this.app.on('event-floor-up', this.handleFloorUp, this);
        this.app.on('event-floor-down', this.handleFloorDown, this);
    }

    forceUpdate() {
        this.app.fire('event-game-state-updated', this.data);
    }

    handleFloorDown() {
        this.data.floor -= 1;
        this.forceUpdate();
    }

    handleFloorUp() {
        this.data.floor += 1;
        this.forceUpdate();
    }

    handlePurchase(cost: number) {
        this.data.money -= cost;

        this.forceUpdate();
    }

    handleUpdateBooster(amount: number) {
        this.data.boosters += amount;

        if(this.data.boosters < 1) this.data.boosters = 1;

        this.forceUpdate();
    }

    handleMoneyEarn(earning: number) {
        earning *= this.data.boosters;

        this.data.money += earning;

        this.forceUpdate();
    }

    handleUpdateHouseType(newType: string) {
        this.data.houseType = newType;

        this.forceUpdate();
    }

    handleUpdateGameState(newState: GameData) {
        this.data = newState;

        this.forceUpdate();
    }
}

pc.registerScript(GameState, 'gameState');