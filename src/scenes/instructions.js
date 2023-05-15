import Phaser from '../lib/phaser.js'
export default class Instructions extends Phaser.Scene

{
constructor()
{
super('instructions')
}

preload()
{
    this.load.image('play', './src/assets/Buttons/play75.png')
    this.load.image('background', './src/assets/Game/grid-bg.png')

}

create()
{
    this.add.image(700, 450, 'background');
    const width = this.scale.width
    const height = this.scale.height

    this.add.text(width * 0.5, height * 0.3, 'Instructions', {
    fontSize: 48}).setOrigin(0.5)

    this.input.keyboard.once('keydown-SPACE', () => {this.scene.start('game')})

    const start = this.add.image(width * 0.5, height * 0.7, 'play').setScale(1.5).setInteractive()

    start.once('pointerdown', () => {this.scene.start('game')});

}

}