"use strict"

let righe=30
let colonne=30

//900:25=[new thing]:x
const rifGrid = 900
const sizeB = 15 //size bottone per 30x30

let mPressed = false// se viene premuta la m allora si aggiungono i muri
let rPressed = false // se viene premuta la M allora si tolgono i muri

//todo: settare queste variabili
let inizio = -1
let fine = -1
let muri = []

let sleep = 0
let moltEuristica = 0


let stop = false
let skip = false
let inCorsoRicerca = false//cambia quando e` in corso la ricerca


$(document).on({
    keydown:function(event){
        //console.log('chiave: '+event.key)
        
        if (event.key=='m'){
            //console.log('entrato true')
            mPressed=true
            rPressed=false
        }else if(event.key=='r'){
            rPressed=true
            mPressed=false
        }
    },
    keyup:function(event){
        if (event.key=='m'){
            //console.log('entrato false')
            mPressed=false
        }else if(event.key=='r'){
            rPressed=false
        }
    }
})



$(function(){
    makeGrid(colonne,righe)
    $('#selectAlgoritmo').on('change', function(event){
        // console.log($(this).val())
        if($(this).val()==2){
            $('#moltEur').attr('hidden', false)
        }else{
            $('#moltEur').attr('hidden', true)
        }
    })
    $('#selectAlgoritmo').val(0)
    $('#iniziaRicerca').attr('hidden', false)
})

function makeGrid(colonne, righe){
    // let size = sizeB/((colonne*righe)/1200)
    let size = sizeB
    $('#griglia').html('')
    $('#indexColonna').html('')
    let righa
    let bottone
    let cella
    $('#indexColonna').append(`<th style="width: ${size}px;height:${size}px"></th>`)
    for(let i=0;i<colonne;i++){
        $('#indexColonna').append(`<th style="width: ${size}px;height:${size}px">${i+1}</th>`)
    }

    for(let i=0;i<righe;i++){
        righa = $('<tr><th>'+(i+1)+'</th></tr>')
        for(let j=0;j<colonne;j++){
            bottone = $(`<button class='celleGriglia' style="width: ${size}px;height:${size}px" id='${i*colonne+j}'></button>`)
            cella = $(`<td></td>`)
            bottone.on({
                mousedown:function(event){
                    //se clicco con lo stesso tasto per cui ha gia` le proprieta` allora torna normale
                    let classe = $(this).attr('class')
                    //cambio di classe in 'negativo'
                    if ((classe=='cellaInizio' && event.which==1)){
                        $(this).attr('class', 'celleGriglia')
                        inizio=-1
                        return
                    }
                    if(classe=='cellaMuro' && event.which==2){
                        $(this).attr('class', 'celleGriglia')
                        muri.splice(muri.indexOf(parseInt($(this).attr('id'))), 1)
                        event.preventDefault()
                        return
                    }
                    if((classe=='cellaFine' && event.which==3)){
                        $(this).attr('class', 'celleGriglia')
                        fine=-1
                        return
                    }
                    //cambio di classe in 'positivo'
                    if(event.which==1){//left click
                        console.log('left click')
                        if(inizio!=-1){
                            // console.log('entrato: '+inizio)
                            $(`#${inizio}`).attr('class', 'celleGriglia')
                        }
                        $(this).attr('class', 'cellaInizio')
                        inizio=parseInt($(this).attr('id'))
                    }else if(event.which==2){//rotellina 
                        $(this).attr('class', 'cellaMuro')
                        muri.push(parseInt($(this).attr('id')))
                        event.preventDefault()
                    }else if(event.which==3){//right click
                        console.log('right click')
                        if(fine!=-1){
                            $(`#${fine}`).attr('class', 'celleGriglia')
                        }
                        $(this).attr('class', 'cellaFine')
                        fine=parseInt($(this).attr('id'))
                    }
                },
                contextmenu:function(event){
                    event.preventDefault()
                    // console.log('prevent')
                },
                mouseenter:function(event){
                    if($(this).attr('class')=='cellaFine' || $(this).attr('class')=='cellaInizio')return
                    if(mPressed && $(this).attr('class')!='cellaMuro'){
                        $(this).attr('class', 'cellaMuro')
                        muri.push(parseInt($(this).attr('id')))
                    }
                    if(rPressed && $(this).attr('class')!='celleGriglia'){
                        $(this).attr('class', 'celleGriglia')
                        muri.splice(muri.indexOf(parseInt($(this).attr('id'))), 1)
                        //console.log(muri)
                    }
                }
            })
            //mettere l'on al bottone
            cella.append(bottone)
            righa.append(cella)
            
        }
        $('#griglia').append(righa)
    }
    
}


function BCliccato(event){
    if(event.which==1){//left click
        console.log('left click')
    }else if(event.which==3){//right click
        console.log('right click')
    }
}

function cambiaGriglia(){
    colonne = $('#colonne').val()
    righe = $('#righe').val()

    makeGrid(colonne, righe)
}

function IniziaRicerca(){
    
    let algoritmo = $('#selectAlgoritmo').val()
    console.log(algoritmo)
    if (algoritmo==0 || algoritmo==null){
        alert('selezionare un algoritmo')
        return
    }
    let grafo = creaGrafo()//implementare i muri
    rimuoviRicerca()
    cambiaBottoniRicerca(true)
    if(algoritmo==1){//dijkstra
        stop = false
        skip = false
        inCorsoRicerca = false
        dijkstra(grafo)
    }else if(algoritmo==2){//A*
        //TODO
    }
}

function cambiaBottoniRicerca(bool){//false=non iniziato true=iniziato 
    $('#iniziaRicerca').attr('hidden', bool)
    $('#bStop').attr('hidden', !bool)
    $('#bSkip').attr('hidden', !bool)
}

function clickStop(){
    stop = !stop
}

function clickSkip(){
    skip=!skip
}

function rimuoviMuri(){
    $('.cellaMuro').attr('class', 'celleGriglia')
    muri=[]
}

function cambiaInpostazioni(){
    //sleep=$('#sleep').val()*1000
    if($('#sleep').val()!=''){
        console.log('entrato dentro il cambio dello')
        sleep=$('#sleep').val()*1000//trasformazione in millisecondi
    }
    if($('#moltEur').text()!=''){
        //todo
    }
}

function creaGrafo(){
    //console.log(muri)
    let grafo = new Map()
    let index = 0
    for(let i=0;i<righe;i++){
        for(let j=0;j<colonne;j++){
            index = i*colonne+j
            collegamentiNodo(grafo,index)
        }
    }
    return grafo
}

function collegamentiNodo(grafo, index){
    if(!grafo.has(index))grafo.set(index, new Set())
    // console.log(index)
    // console.log(muri.includes(index))
    if(muri.includes(index))return
    let appIndex = parseInt(index+1)
    // console.log(colonne)
        // console.log(`prima: ${index%colonne}\n 
        //             seconda: ${index%colonne}\n 
        //             terza: ${Math.floor(index/colonne)}\n 
        //             quarta: ${Math.floor(index/colonne)}`)
    if(index%colonne!=colonne-1 && !muri.includes(appIndex)) {//destra
        if(!grafo.has(appIndex))grafo.set(appIndex, new Set())
        grafo.get(index).add(appIndex)
        grafo.get(appIndex).add(index)
    }
    appIndex = parseInt(index-1)
    if(index%colonne!=0 && !muri.includes(appIndex)) {//sinistra
        if(!grafo.has(appIndex))grafo.set(appIndex, new Set())
        grafo.get(index).add(appIndex)
        grafo.get(appIndex).add(index)
    }
    appIndex = parseInt(index)-parseInt(colonne)
    if(Math.floor(index/colonne)!=0 && !muri.includes(appIndex)) {//alto
        if(!grafo.has(appIndex))grafo.set(appIndex, new Set())
        grafo.get(index).add(appIndex)
        grafo.get(appIndex).add(index)
    }
    appIndex = parseInt(index)+parseInt(colonne)
    // console.log(appIndex)
    // console.log(index)
    // console.log(colonne)
    if(Math.floor(index/colonne)!=righe-1 && !muri.includes(appIndex)) {//basso
        if(!grafo.has(appIndex))grafo.set(appIndex, new Set())
        grafo.get(index).add(appIndex)
        grafo.get(appIndex).add(index)
    }
    // console.log('index: '+index+') ')
    // console.log(grafo.get(index))

}

function rimuoviRicerca(){
    $('.cellaVisitata').attr('class', 'celleGriglia')
    $('.cellaPercorso').attr('class', 'celleGriglia')
}

function settaVarGlobaliFineRicerca(){
    //set a default delle variabili
    inCorsoRicerca=false
    skip = false
}


//dijkstra
async function dijkstra(grafo){//inizio e` come var globale, e` async per permettere lo sleep utilizzato dopo
    console.log(grafo)
    let dist = new Map()
    let precedente = new Map()
    let daEsplorare = new Set()
    for(let i=0;i<grafo.size;i++){
        dist.set(i, Infinity)
        precedente.set(i, null)
        daEsplorare.add(i)
    }
    dist.set(inizio, 0)
    let node
    while(daEsplorare.size!=0){
        console.log('entrato')

        while(stop)await new Promise(r => setTimeout(r, 1000));//attesa con lo stop

        if(sleep!=0 && !skip){// se lo skip e' true (si vuole skippare) allora non entra nello sleep e va dritto dritto alla fine
            await new Promise(r => setTimeout(r, sleep));
        }
        
        node = minDistNode(dist, daEsplorare)
        if(
            $(`#${node}`).attr('class')!='cellaInizio' &&
            $(`#${node}`).attr('class')!='cellaFine'
        ) $(`#${node}`).attr('class','cellaVisitata')

        if(node==-1){
            console.log('entrato dentro -1')
            break//finisci
        }
        daEsplorare.delete(node)
        for(let vicino of grafo.get(node)){
            let arg = dist.get(node)+1
            if(arg<dist.get(vicino)){
                dist.set(vicino, arg)
                precedente.set(vicino, node)
                //potrei rimetterlo nella coda 
            }
        }
    }
    //mostra il percorso trovato
    ricostruisciPercorso(precedente)
}

function minDistNode(dist, daEsplorare){
    let min = Infinity
    let index = -1
    for(let app of daEsplorare){//itera sugli oggetti del set
        if(dist.get(app)<min){
            index = app
            min=dist.get(app)
        }
    }
    return index
}

//fine dijkstra

function AStar(grafo){//inizio e fine globali
    //var per usi generali dell'algoritmo
    let nodiVisitati = new Set()
    let nodiDaVisitare = new Set()
    let dist = new Map()//da inizializzare (distanza dall'inizio)
    let vieneDa= new Map()//come from
    let hScore = new Map()//score ricavato dall'euristica (distanza ipotetica dalla fine)
    let fScore = new Map()//totale distanza dalla fine

    

    for(let i=0;i<grafo.size;i++){
        nodiDaVisitare.add(i)
        dist.set(i, Infinity)
        vieneDa.set(i, null)// da vedere
        hScore.set(i, Infinity)
        fScore.set(i, Infinity) 
    }

    while(nodiDaVisitare.size!=0){
        console.log('ebtrati')
        node = minDistNode(fScore, nodiDaVisitare)
        if(node==fine){
            ricostruisciPercorso(vieneDa)//far si che si visualizzi il percorso
            return true//riuscito a trovare il percorso
        }else if(node==-1){
            break//non c'e` soluzione
        }
        nodiDaVisitare.delete(node)
        nodiVisitati.add(node)
        for(let vicino of grafo.get(node)){
            if(nodiVisitati.has(vicino)){//se il nodo e` gia` stato visitato allora si va avanti
                continue
            }
            let tentativoGScore = disto.get(node)+1//distanza tra x e y e` sempre 1
            let tentativoMigliore
            if(!nodiDaVisitare.has(vicino)){
                nodiDaVisitare.add(vicino)
                tentativoMigliore=true
            }else if(tentativoGScore<dist.get(vicino)){
                tentativoMigliore=true
            }else tentativoMigliore=false

            if (tentativoMigliore){
                vieneDa.set(vicino, node)
                dist.set(node, tentativoGScore)
                hScore.set(vicino, heuristic(vicino))
                fScore.set(vicino, parseInt(tentativoGScore)+parseInt(hScore.get(vicino)))

            }
        }
    }
    settaVarGlobaliFineRicerca()
    cambiaBottoniRicerca(false)
    return false//non riuscito a trovare il percorso

}

function ricostruisciPercorso(precedente){//fine data come global
    let index = fine
    let cont =0
    while(precedente.get(index)!=null && precedente.get(index)!=inizio){// si potrebbe mettere anche qui lo sleep
        $(`#${precedente.get(index)}`).attr('class', 'cellaPercorso')
        index = precedente.get(index)
        cont++
    }
    $('#contNodiAtt').attr('hidden', false)
    $('#nodiAttraversati').html('nodi attraversati: '+cont)
    if(precedente.get(index)!=inizio)alert('dal punto di inizio non si puo` raggiungere\n il punto di fine')
    settaVarGlobaliFineRicerca()
    cambiaBottoniRicerca(false)
}

function heuristic(index){//la fine e` globale
    return 0
}