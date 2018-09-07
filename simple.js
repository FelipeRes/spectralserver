

async function m1 (){
  console.log("primeira funcao");
}

async function m2(mensagem, callback){
  console.log(mensagem);
  list = []
  for(i=0;i<10000000;i++){
    list.push(i)
    list.splice(i,1)
  }
  callback();
}

m2('olá',m1)
console.log("enquanto espera")