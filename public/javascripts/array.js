Array.prototype.average_t=function(){
    var sum=0;
    var j=0;
    var average_t = [];
    for (var i=0; i < this.length ;i++) {
          if(i>100000){
            sum = sum + ( parseFloat(this[i-1][1]) + parseFloat(this[i][1]) )/2;
          }else{
            sum = sum + parseFloat(this[i][1]);
          }
          j++;
          average_t[i] = [ this[i][0] , sum/j];
    }
    if(j===0){
        return 0;
    }else{
        return average_t;
    }
}

Array.prototype.average_intra_t=function(){
    var sum=0;
    var j=0;
    var average_t = [];
    for (var i=0; i < this.length ;i++) {
          if(i<4) {
             sum = parseFloat(this[i][1]);
          } else {
             sum = ( parseFloat(this[i-3][1]) + parseFloat(this[i-2][1]) + parseFloat(this[i-1][1]) + parseFloat(this[i][1]) )/4;
          }
          j++;
          average_t[i] = [ this[i][0] , sum];
    }
    if(j===0){
        return 0;
    }else{
        return average_t;
    }
}