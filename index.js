const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modalEl');
const bigScoreEl = document.querySelector('#bigScoreEl');

class Map {

    constructor(width, height){
        this.width = width;
        this.height = height;
    }

    init(){

    }

    move(){
        
    }
}

class Entity {

    constructor(height, width, x, y){
      this.height = height;
      this.width = width;
      this.x = x;
      this.y= y;
    }
    
    attack(){
      
    }
    
    moveRight(){
      
    }
    
    moveLeft(){
      
    }
    
    moveDown(){
      
    }
    
    moveUp(){
      
    }
    
}

class Level {

    constructor(currentLevel, latestLevel, maxLevel){
        this.currentLevel = currentLevel;
        this.latestLevel = latestLevel;
        this.maxLevel = maxLevel;
    }

    setLevel(){

    }

    getCurrentLevel(){

    }
}

class Hero extends Entity {

    constructor(height, width, x, y, radius, color, life, score){
        super(height, width, x, y)
        this.radius = radius;
        this.color = color;
        this.life = life;
        this.score = score;
    }

    increaseScore(score){
        score += 1;
        scoreEl.innerHTML = score;
        this.score = score
    }
    
    calculateLife(){
      
    }
    
    saveScore(){
      
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

}

class Monster extends Entity {

    constructor(height, width, x, y, radius, life, color, effect, type, velocity){
        super(height, width, x, y)
        this.radius = radius;
        this.life = life;
        this.color = color;
        this.effect = effect;
        this.type = type;
        this.velocity = velocity;
    }

    moveRandom(){

    }

    saveScore(){

    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Particle {
    
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw(){
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

class Projectile {
    
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const cxCenter = canvas.width / 2;
const cyCenter = canvas.height / 2;

let projectiles = []; //projectiles array
let monsters = []; //monsters array
let particles = []; //explosion particles array
let player = new Hero(20,20,cxCenter,cyCenter,20,'white',100,0);

function init(){
    player = new Hero(20,20,cxCenter,cyCenter,20,'white',100,0);
    projectiles = [];
    monsters = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
}

function spawnMonster(){    //make monster randomly for every 1 second
    setInterval(() => {
        let x;
        let y;
        const height = 30;
        const width = 30;
        const radius = Math.random() * (height+width/2 - 10) + 10;
        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }else{
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        const angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x);
        const velocity = {x : Math.cos(angle), y : Math.sin(angle)};

        monsters.push(new Monster(height,width,x,y,radius,500,color,null,null,velocity))}, 1000)
}

let animationId;
let score = 0;
function animate(){     //make animation frame
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    player.draw();

    //particle removed soon after explosion
    particles.forEach((particle, index) => {
        if(particle.alpha <= 0){
            particles.splice(index,1)
        }else{
            particle.update();
        }
    })

    //projectile removed after out of canvas
    projectiles.forEach((projectile, index) => {
        projectile.update();
        if(projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height){
            setTimeout(() => {
                projectiles.splice(index,1);
            }, 0)
        }
    })

    //monster collision with player
    monsters.forEach((monster,index) => {
        monster.update()
        const dist = Math.hypot(player.x - monster.x, player.y - monster.y)
        if(dist - monster.radius - player.radius < 1){
            cancelAnimationFrame(animationId);
            modalEl.style.display = 'flex';
            bigScoreEl.innerHTML = score;
        }

        //projectiles collision with monster
        projectiles.forEach((projectile,projectileIndex) => {
            const dist = Math.hypot(projectile.x - monster.x, projectile.y - monster.y)
            if(dist - monster.radius - projectile.radius < 1){
                score += 1;
                scoreEl.innerHTML = score;

                //make particle when projectiles collide with monster
                for(let i = 0; i < monster.radius*2; i++){
                    particles.push(new Particle(projectile.x, projectile.y, 3, monster.color, {x:(Math.random() - 0.5) * (Math.random() * 3), y:(Math.random() - 0.5) * (Math.random() * 3)}))
                }

                //monster shrink when projectiles collide with monster
                if(monster.radius - 10 > 10){
                    gsap.to(monster, {
                        radius: monster.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex,1);
                    }, 0)
                }else{
                        setTimeout(() => {
                        monsters.splice(index,1);
                        projectiles.splice(projectileIndex,1);
                    }, 0)
                }
            }
        })                  
    })
}

//action on click
window.addEventListener('click', (event) => {
        const angle = Math.atan2(event.clientY - canvas.height/2, event.clientX - canvas.width/2);
        const velocity = {x : Math.cos(angle)*5, y : Math.sin(angle)*5}
        projectiles.push(new Projectile(canvas.width/2,canvas.height/2,5,'white',velocity))
    })

//action on start
startGameBtn.addEventListener('click', () => {
    init();
    player.draw();
    animate();
    spawnMonster();
    modalEl.style.display = 'none';
})