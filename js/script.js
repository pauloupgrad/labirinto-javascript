(function(){
    let cnv = document.querySelector("canvas");
    let ctx = cnv.getContext("2d");
    //COSTANTES DE Altura e Largura do CANVAS
    const WIDTH = cnv.width, HEIGHT = cnv.height;
    //COSTANTES DE CONTROLE DE TECLADO
    const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
    //movimento do player
    let mvLeft = mvUp = mvRight = mvDown = false;
    //Tamanho em pixel de cada tile
    let tileSize = 64;
    //Tamanho do sprite
    let tileSrcSize = 96;

    //CONFIG O OBJETO IMAGEM NO SPRITE
    let img = new Image();
        img.src = "img/img.png";
        img.addEventListener("load", function(){
            requestAnimationFrame(loop, cnv);
        },false);

    //PAREDES COLIÇÂO
    let walls = [];

    //CONFIG O OBJETO PLAYER
    let player = {
        x: tileSize + 2,
        y: tileSize + 2,
        width: 24,
        height: 32,
        speed: 2,
        srcX: 0,
        srcY: tileSrcSize,
        countAnim: 0
        
    }
    //CONFIG A MATRIZ LABIRINTO
    let maze = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
        [1,1,1,0,1,1,1,0,0,1,0,0,0,1,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,0,1,1,1,1,1,1,0,1,1,1,1,1],
        [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,1,1,1,0,0,1,1,1,1,1,1,1,1,1,0,1],
        [1,0,1,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,1],
        [1,0,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1],
        [1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,0,1],
        [1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,1],
        [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
    //ARMAZENANDO TAMANHO DO LABIRINTO
    const T_WIDTH = maze[0].length * tileSize,
          T_HEIGHT = maze.length * tileSize;
        
    //ESTRUTURA DE COLIÇÃO COM PAREDE 
    for(let row in maze){
        for(let column in maze[row]){
            let tile = maze[row][column];
            if(tile === 1){
                let wall = {
                    x: tileSize * column,
                    y: tileSize * row,
                    width: tileSize,
                    height: tileSize
                };
                walls.push(wall);
            }
        }
    }//fim dos for

    //CONFIG O OBJETO CAMERA
    let cam = {
        x: 0,
        y: 0,
        width: WIDTH,
        height: HEIGHT,
        innerLeftBoundary: function(){
            return this.x + (this.width*0.25);
        },
        innerTopBoundary: function(){
            return this.y + (this.height*0.25);
        },
        innerRightBoundary: function(){
            return this.x + (this.width*0.75);
        },
        innerBottomBoundary: function(){
            return this.y + (this.height*0.75);
        }
    };
    // Função que verifica colição com walls (paredes)
    const blockRectangle = (objA, objB) => {
        let distX = (objA.x + objA.width/2) - (objB.x + objB.width/2);
        let distY = (objA.y + objA.height/2) - (objB.y + objB.height/2);

        //soma da altura e largura dos obj
        let sumWidth = (objA.width + objB.width)/2;
        let sumHeight = (objA.height + objB.height)/2;

        //verificando se ha colição ou não pegando valor absoluto usando Math.abs
        if(Math.abs(distX) < sumWidth && Math.abs(distY) < sumHeight){
            let overlapX = sumWidth - Math.abs(distX);
            let overlapY = sumHeight - Math.abs(distY);
            //verificar de que lado houve a colição
            if(overlapX > overlapY){
                objA.y = distY > 0 ? objA.y + overlapY : objA.y - overlapY;
            } else {
                objA.x = distX > 0 ? objA.x + overlapX : objA.x - overlapX;
            }
        }
    }
    //Movimentando do player no teclado quando a tecla precionada
    const keydownHandler = (e) => {
        let key = e.keyCode;
        switch(key){
            case LEFT:
                mvLeft = true;
                break;
            case UP:
                mvUp = true;
                break;
            case RIGHT:
                mvRight = true;
                break;
            case DOWN:
                mvDown = true;
                break;         
        }
    }
    //Parando o movimentando do player no teclado quando a tecla solta
    const keyupHandler = (e) => {
        let key = e.keyCode;
        switch(key){
            case LEFT:
                mvLeft = false;
                break;
            case UP:
                mvUp = false;
                break;
            case RIGHT:
                mvRight = false;
                break;
            case DOWN:
                mvDown = false;
                break;         
        }
    }

     //ENCHERGA OS MOVIMANTOS DO TECLADO
     window.addEventListener("keydown",keydownHandler,false);
     window.addEventListener("keyup",keyupHandler,false);

    //UPDATE
    const update = () => {
        //Verifica se player esta movendo para esquerda ou para direita
        if(mvLeft && !mvRight){//ESQUERDA
            player.x -= player.speed;
            player.srcY = tileSrcSize + player.height * 2;
        } else
        if(mvRight && !mvLeft){//DIREITA
            player.x += player.speed;
            player.srcY = tileSrcSize + player.height * 3;
        }
        //Verifica se player esta movendo para cima ou para baixo
        if(mvUp && !mvDown){//SUBINDO
            player.y -= player.speed;
            player.srcY = tileSrcSize + player.height * 1;
        } else 
        if(mvDown && !mvUp){//DESCENDO
            player.y += player.speed;
            player.srcY = tileSrcSize + player.height * 0;
        }

        if(mvLeft || mvRight || mvUp || mvDown){
            player.countAnim++;
            if(player.countAnim >= 40){
                player.countAnim = 0;
            }
            player.srcX = Math.floor(player.countAnim/5) * player.width;
        } else{
            player.srcX = 0;
            player.countAnim = 0;
        }

        //Verificação se player colidiu com paredes(walls)
        for(let i in walls){
            let wall = walls[i];
            blockRectangle(player,wall);
        }

        //Ajuste da camera na Tela
        if(player.x < cam.innerLeftBoundary()){
            cam.x = player.x - (cam.width * 0.25);
        }
        if(player.y < cam.innerTopBoundary()){
            cam.y = player.y - (cam.height * 0.25);
        }
        if(player.x + player.width > cam.innerRightBoundary()){
            cam.x = player.x + player.width - (cam.width * 0.75);
        }
        if(player.y + player.height > cam.innerBottomBoundary()){
            cam.y = player.y + player.height - (cam.height * 0.75);
        }
        //AJUSTE FINAL DA CAMERA NA TELA
        cam.x = Math.max(0,Math.min(T_WIDTH - cam.width,cam.x));
        cam.y = Math.max(0,Math.min(T_HEIGHT - cam.height,cam.y));
    }

    //REDERIZA NA TELA
    const render = () => {
        //CRIANDO LABIRINTO
        ctx.clearRect(0,0,WIDTH,HEIGHT);//Limpando o rastro na tela
        ctx.save();//salvando o estado do contesto
        ctx.translate(-cam.x,-cam.y);
        for(let row in maze){
            for(let column in maze[row]){
                let tile = maze[row][column];                
                let x = column*tileSize;
                let y = row*tileSize;
                ctx.drawImage(
                    img,
                    tile * tileSrcSize,0,tileSrcSize,tileSrcSize,
                    x,y,tileSize,tileSize
                );
                
            }
        }//fim dos for

        //CRIANDO PERSONAGEM       
        //renderizando o sprite do player
        ctx.drawImage(
            img,
            player.srcX,player.srcY,player.width,player.height,
            player.x,player.y,player.width,player.height
        );
        ctx.restore();//chamando o restore para que cada contesto fique com sua cor.
    }
    
    const loop = () => {
        update();
        render();
        requestAnimationFrame(loop, cnv);
    }    
}());
