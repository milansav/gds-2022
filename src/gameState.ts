type GameData = {
    money: number,
    floor: number,
    houseType: string,
    boosters: number,
    baseEarning: number, //Per minute
};

class GameState extends pc.ScriptType {
    data: GameData = {
        money: 1000,
        floor: 0,
        houseType: 'EMPTY',
        boosters: 1,
        baseEarning: 1000
    };

    initialize() {
        this.app.on('event-purchase', this.handlePurchase, this);
        this.app.on('force-state-update', this.forceUpdate, this);
        this.app.on('event-update-booster', this.handleUpdateBooster, this);
        this.app.on('event-earn-money', this.handleMoneyEarn, this);
        this.app.on('event-update-game-state', this.handleUpdateGameState, this);
        this.app.on('event-update-game-state-housetype', this.handleUpdateHouseType, this);
        this.app.fire('event-game-state-updated', this.data);
    }

    forceUpdate() {
        this.app.fire('event-game-state-updated', this.data);
    }

    handlePurchase(cost: number) {
        this.data.money -= cost;

        this.forceUpdate();
    }

    handleUpdateBooster(amount: number) {
        this.data.boosters += amount;

        this.forceUpdate();
    }

    handleMoneyEarn(earning: number) {
        earning *= this.data.boosters;

        this.data.money += earning;

        this.forceUpdate();
    }

    handleUpdateHouseType(newType: string) {
        this.data.houseType = newType;

        console.log(this.data.houseType);

        this.forceUpdate();
    }

    handleUpdateGameState(newState: GameData) {
        this.data = newState;

        this.forceUpdate();
    }
}

pc.registerScript(GameState, 'gameState');