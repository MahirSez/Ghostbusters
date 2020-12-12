(function (global) {

    var rows, cols, board;
    var ghostX , ghostY;
    var near_dist, far_dist;
    var debug_mode = 0;
    var catch_mode = 0;
    var game_over = 0;

    

    var censorX = new Array();
    var censorY = new Array();

    var dx = [ 0, 0 , -1, 1 , 1, 1 , -1, -1, 0];
    var dy = [ 1, -1 , 0, 0 , 1, -1, 1, -1, 0];
    var transition_prob = [ 0.24, 0.24, 0.24, 0.24, 0.008, 0.008, 0.008, 0.008 ,0.008 ];


    var cell_clicked = function(event) {


        if(game_over) return;
        

        var co_ord = event.srcElement.getAttribute("id").split("-");
        var x = parseInt(co_ord[0]);
        var y = parseInt(co_ord[1]);

        if(catch_mode) {

            if(x == ghostX && y == ghostY) {
                document.getElementById("catch_ghost").classList.remove("btn-warning");
                document.getElementById("catch_ghost").classList.add("btn-success");
                document.getElementById("catch_ghost").innerHTML = "Ghost Found! ";
                
                for(var  i = 0 ; i < rows ; i++ ) {
                    for(var j =0 ; j < cols; j++ ) {
                        board[i][j] = 0;
                    }
                }
                board[x][y] = 100.0;
                game_over = 1;
            }
            else {
                document.getElementById("catch_ghost").innerHTML = "Nop! Try again.";
                board[x][y] = 0.0;
            }
        }
        else {
            censorX.push(x);
            censorY.push(y);
        }


        var color = get_cell_color(x, y, ghostX, ghostY);
        update_probabilities(x, y, color);
    }

    var update_probabilities = function(x, y, color) {
        console.log(x , y , color);

        var new_board = new Array(rows);
        for(var i =0 ; i < rows; i++ ) {
            new_board[i] = new Array(cols);
            for(var j =0 ;j < cols; j++ ) new_board[i][j] = 0.0;
        }

        var tot = 0;

        for(var xx = 0 ; xx < rows ; xx++) {
            for(var yy = 0 ; yy < cols ; yy++) {

                var target_color = get_cell_color(x,y, xx, yy);
                if(target_color == color) {
                    new_board[xx][yy] = parseFloat(board[xx][yy]);
                    tot += parseFloat(board[xx][yy]);
                }
            }
        }
        
        for(var xx = 0 ; xx < rows; xx++) {
            for( var yy = 0 ; yy < cols ; yy++) {
                new_board[xx][yy]= (100.0*parseFloat(new_board[xx][yy]))/tot;
                new_board[xx][yy] = new_board[xx][yy].toFixed(2);
            }
        }
        board = new_board;
        draw_board(); 
    }

    var clear_board = function() {
        var table = document.getElementById('board');
        while(table.rows.length) table.deleteRow(0);
    }

    var init_probability = function() {
        board = new Array(rows);
        var prob = (100 / (rows*cols)).toFixed(2);

        for(var i =0; i < rows ; i++ ) {
            board[i] = new Array(cols);
            for(var j =0 ; j < cols ; j++ ) {
                board[i][j] = prob;
            }
        }
    }

    var draw_board = function() {

        clear_board();
        
        var table = document.getElementById('board');

        for(var i = 0; i < rows; i++){
            var tr = table.insertRow();
            for(var j = 0; j < cols; j++){

                var cell_val = parseFloat(board[i][j]);

                var td = tr.insertCell();
                td.id = i + "-"+ j; 
                td.appendChild(document.createTextNode(board[i][j]));

                if(debug_mode) td.style.backgroundColor = get_cell_color(i,j, ghostX, ghostY);
                else td.style.backgroundColor = 'rgba(0, 200, 200, #)'.replace('#', cell_val/10);
                td.onclick = cell_clicked;
                
            }
        }

        for(var i = 0 ; i < censorX.length ; i++) {
            document.getElementById(censorX[i]+"-"+censorY[i]).style.backgroundColor=get_cell_color(censorX[i], censorY[i], ghostX, ghostY);
        }
    }
    var init_ghost = function() {
        ghostX = Math.floor(Math.random()*rows);
        ghostY = Math.floor(Math.random()*cols);
        console.log("Ghost at: " + ghostX + " " + ghostY);
    }

    var move_ghost = function() {
        var random_val = Math.random();
        var tot_prob = 0;

        for(var k =0 ; k < 9 ; k++) {
            var xx = ghostX + dx[k];
            var yy = ghostY + dy[k];
            if(xx >=0 && xx < rows && yy >=0 && yy < cols) tot_prob += transition_prob[k];
        }
        var prob_now = 0;

        for(var k =0 ; k < 9 ; k++) {
            var xx = ghostX + dx[k];
            var yy = ghostY + dy[k];

            if(xx >=0 && xx < rows && yy >=0 && yy < cols) {
                prob_now +=  transition_prob[k]  / tot_prob;
                if(prob_now >= random_val) {
                    ghostX = xx;
                    ghostY = yy;
                    return;
                }
            }
        }
    }


    var init_table = function() {
        console.log("Creating new table: " +rows + " " + cols);

        game_over = 0;
        censorX = new Array();
        censorY = new Array();
        if(debug_mode) debug();
        if(catch_mode) catch_ghost();

        init_probability();
        init_ghost();
        draw_board();
    }

    var advance_time = function(event) {

        if(game_over) return;

        censorX = new Array();
        censorY = new Array();
        move_ghost();

     

        console.log("Ghost at: " + ghostX + " " + ghostY);

        var new_board = new Array(rows);
        for(var i= 0; i < rows ; i++) {
            new_board[i] = new Array(cols);
            for(var j = 0; j < cols; j++ ) new_board[i][j] = 0;
        }
        
        for(var x =0 ;x < rows ; x++ ) {
            for(var y =0 ; y < cols; y++ ) {
                
                var tot_prob = 0;
                for(var k =0 ; k < 9 ; k++) {
                    var xx = x + dx[k];
                    var yy = y + dy[k];

                    if(xx >=0 && xx < rows && yy >=0 && yy < cols) tot_prob += transition_prob[k];
                }

                for(var k =0 ; k < 9 ; k++) {
                    var xx = x + dx[k];
                    var yy = y + dy[k];

                    if(xx >=0 && xx < rows && yy >=0 && yy < cols) {
                        new_board[xx][yy] += ( transition_prob[k] *  board[x][y] ) / tot_prob;
                    }
                }
            }
        }

        for(var i =0; i< rows; i++ ) {
            for(var j = 0; j < cols; j++ ) {
                new_board[i][j] = new_board[i][j].toFixed(2);
            }
        }
        
        board = new_board;   
        draw_board();
    }

    var catch_ghost = function(event) {

        if(game_over) return;

        censorX = new Array();
        censorY = new Array();
        draw_board();

        catch_mode ^= 1;

        document.getElementById("catch_ghost").innerHTML = "Catch Ghost";
        if(catch_mode == 1) {

            document.getElementById("catch_ghost").classList.remove("btn-dark");
            document.getElementById("catch_ghost").classList.add("btn-warning");
        }
        else {
            document.getElementById("catch_ghost").classList.remove("btn-warning");
            document.getElementById("catch_ghost").classList.add("btn-dark");
            
        }
    }

    var get_cell_color = function(x1 , y1 , x2, y2) {
        var dist = Math.abs(x1 - x2) + Math.abs(y1 - y2);
        
        if(dist <= near_dist) return "red";
        else if(dist <= near_dist + far_dist) return "orange";
        return "green";
    }

    var debug = function(event) {
        
        debug_mode ^= 1;
        if(debug_mode == 1) {

            document.getElementById("debug").classList.remove("btn-dark");
            document.getElementById("debug").classList.add("btn-warning");
        }
        else {
            document.getElementById("debug").classList.remove("btn-warning");
            document.getElementById("debug").classList.add("btn-dark");
            
        }
        draw_board();
    }

    var update_dimentsion = function(event) {
        var input_row_count = document.getElementById("rows").value;
        var input_col_count = document.getElementById("cols").value;

        if(input_row_count < 1 || input_row_count > 16) return;
        if(input_col_count < 1 || input_col_count > 16) return;

        if(input_row_count != rows || input_col_count != cols ) {
            rows = input_row_count;
            cols = input_col_count;
            init_table();
        }
    }

    


    document.addEventListener("DOMContentLoaded", function(event) {	

        document.querySelector("#rows").addEventListener("click",update_dimentsion);
        document.querySelector("#cols").addEventListener("click",update_dimentsion);
        document.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') update_dimentsion(e);
        });
        document.querySelector("#advance_time").addEventListener("click",advance_time);
        document.querySelector("#catch_ghost").addEventListener("click",catch_ghost);
        document.querySelector("#debug").addEventListener("click",debug);

        rows = document.getElementById("rows").value;
        cols = document.getElementById("cols").value;
        near_dist = document.getElementById("near").value;
        near_dist = parseInt(near_dist);
        far_dist = document.getElementById("far").value;
        far_dist = parseInt(far_dist);

        init_table();
    });
    

})(window);