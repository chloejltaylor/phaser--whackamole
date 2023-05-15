import Phaser from '../lib/phaser.js'


export default class Game extends Phaser.Scene
{
    timedEvent
    showtarget
    mouseY = 0
    mouseX = 0
    isDown = false
    lastFired = 0
    stats
    speed
    shooter
    bullets
    targets
    timer
    numhit = 0
    targets_hit_text = ""
    targethit = false
    targetdelay = 4000
    flametarget


    constructor() 
    {
    super('game')
    }

    init()
    {
    this.numhit = 0
    }

    preload()
    {
        this.load.image('target', './src/assets/Game/idle_1.png')
        this.load.image('target-hit', './src/assets/Game/correct_1.png')
        this.load.image('decoy', './src/assets/Game/idle_2.png')
        this.load.image('background', './src/assets/Game/grid-bg.png')
        this.load.image('shooter', './src/assets/Players/player.png')
        this.load.image('bullet1', './src/assets/Items/star.png')
        this.load.audio('boing', './src/assets/Sounds/cartoonboing.mp3')
        this.load.audio('pop', './src/assets/Sounds/cartoonbubblepop.mp3')
        this.load.spine("hand","./src/assets/Anim/hand/onboarding_hand.json","./src/assets/Anim/hand/onboarding_hand.atlas")
        this.load.spritesheet('fire', './src/assets/Anim/firesprite.png', { frameWidth: 31, frameHeight: 48 });
        this.load.spritesheet('water', './src/assets/Anim/watersprite.png', { frameWidth: 31, frameHeight: 48 });

    }

    create ()
    {

        this.add.image(700, 450, 'background');
        const style = { color: '#f00', fontSize: 94 }
        this.targets_hit_text = this.add.text(240,10,'0', style).setScrollFactor(0).setOrigin(0.5, 0)




        class Bullet extends Phaser.GameObjects.Image
        {
            constructor (scene)
            {
                super(scene, 0, 0, 'bullet1');

                this.incX = 0;
                this.incY = 0;
                this.lifespan = 0;

                this.speed = Phaser.Math.GetSpeed(600, 1);
            }

            fire (x, y)
            {
                this.setActive(true);
                this.setVisible(true);

                //  Bullets fire from the place where the shooter is of the screen to the given x/y
                this.setPosition(700, 750);

                const angle = Phaser.Math.Angle.Between(x, y, 700, 750);

                this.setRotation(angle);
                this.incX = Math.cos(angle);
                
                this.incY = Math.sin(angle);

                this.lifespan = 1000;

            }

            update (time, delta)
            {
                this.lifespan -= delta;

                this.x -= this.incX * (this.speed * delta);
                this.y -= this.incY * (this.speed * delta);

                if (this.lifespan <= 0)
                {
                    this.setActive(false);
                    this.setVisible(false);
                }
            }
        }

        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 50,
            runChildUpdate: true
        });

        

        this.shooter = this.add.sprite(700, 750, 'shooter').setDepth(1).setRotation(0)
        this.input.on('pointerdown', pointer =>
        {

            this.isDown = true;
            this.mouseX = pointer.x;
            this.mouseY = pointer.y;

        });

        this.input.on('pointerup', pointer =>
        {

            this.isDown = false;

        });

        const flametarget = {
            key: 'burn',
            frames: 'fire',
            frameRate: 3,
            repeat: -1,
            // repeatDelay: 2000
        };

        this.anims.create(flametarget)

        const water = {
            key: 'burst',
            frames: 'water',
            frameRate: 5,
            repeat: -1,
        };

        this.anims.create(water)

        this.targets = this.physics.add.group({
            key: 'target',
            maxSize: 12,
            active: false,
            visible: false,
            enable: false,

        });


        this.time.addEvent({
            delay: this.targetdelay,         
            callback: showtarget,
            callbackScope: this,
            loop: true
        })

        function showtarget () {
            console.log("show target")
            
            const target = this.targets.get();
            target.setTexture('fire', 4);
            target.play({
                key: 'burn',
            });
            if (!target) { return; }
    
            let x = Phaser.Math.Between(500, 800)
            let y = Phaser.Math.Between(200, 600)
            target.enableBody(true, x, y, true, true)
            this.time.addEvent({
                delay:  3000,                // ms
                callback: function() {
                    target.disableBody()
                    target.setActive(false);
                    target.setVisible(false);
                    console.log("disabled")
                },
                callbackScope: this,

            })
        }

        // timerTarget.paused = true;
        
        this.physics.add.overlap(this.bullets, this.targets, this.handleHitTarget, null, this);

        this.mouseX = 75

    }



    update (time, delta)
    {

       if (this.isDown && time > this.lastFired)
        {
            const bullet = this.bullets.get();
            

            if (bullet)
            {
                bullet.fire(this.mouseX, this.mouseY);

                this.lastFired = time + 100;
            }
        }
        // console.log("rotation: "+this.shooter.rotation + Math.PI / 2) 
        // this.mouseX = 701
        // console.log("this.mouseX: "+this.mouseX)
        // console.log("this.mouseY: "+this.mouseY)
        // console.log("this.shooterX: "+this.shooterX)
        // console.log("this.shooterY: "+this.shooterY)
        this.shooter.setRotation(Phaser.Math.Angle.Between(this.mouseX, this.mouseY, this.shooter.x, this.shooter.y) - Math.PI / 2);
        // this.timer = 1000*delta
        if (this.numhit==5){
            console.log("you win")
            this.timedEvent = this.time.delayedCall(2000, this.playGameOver, [], this)
        }

    }

    
    handleHitTarget(bullet,target){

        target.setTexture('water',4)
        target.play({
            key: 'burst',
        });
        this.time.delayedCall(1000, hideHitTarget, [], this)
        target.disableBody(false, false)

        function hideHitTarget(){
            target.setVisible(false)
            target.setActive(false)
            this.targethit = false
        }
           this.numhit++
        
        this.targets_hit_text.text = this.numhit
        console.log("hit!")
    }





    playGameOver() {
        
                this.scene.start('game-over')
    }

}