class Parallax extends pc.ScriptType {
    initialize() {

    }
}

pc.registerScript(Parallax, 'parallax');
Parallax.attributes.add('templates', {
    type: 'asset',
    array: true,
})