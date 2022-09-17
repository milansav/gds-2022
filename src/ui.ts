class UI extends pc.ScriptType {

    css: pc.Asset;
    html: pc.Asset;
    div: HTMLDivElement;

    initialize() {
        const style = document.createElement('style');

        document.head.appendChild(style);

        style.innerHTML = this.css.resource || '';

        this.div = document.createElement('div');
        this.div.classList.add('container');
        this.div.innerHTML = this.html.resource || '';

        document.body.appendChild(this.div);
    }
}

pc.registerScript(UI, 'ui');

UI.attributes.add('css', {type: 'asset', assetType:'css', title: 'CSS Asset'});
UI.attributes.add('html', {type: 'asset', assetType:'html', title: 'HTML Asset'});