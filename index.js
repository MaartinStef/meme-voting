const contractAddress = 'ct_25qpLuCMTPKgK8mKzTrYLRqJzdnY9xjJ6Sr2eee9mf9ztm5enx';
var client = null;
var memeArray = [];
var memesLength = 0;

// var memeArray = [
//         {"creatorName":"Alice","memeUrl":"https://pbs.twimg.com/media/Dsdt6gOXcAAksLu.jpg","votes":18,"index":1,"rank":1},
//         {"creatorName":"Bob","memeUrl":"https://pbs.twimg.com/media/C4Vu1S0WYAA3Clw.jpg","votes":27,"index":2,"rank":2},
//         {"creatorName":"Carol","memeUrl":"https://pbs.twimg.com/media/DeHbsSAU0AAbQAq.jpg","votes":18,"index":3,"rank":3}
//     ]

// Toto treba abz mustache renderov časť ktorá je v index.html 
function renderMemes() {
memeArray = memeArray.sort(function(a,b){return b.votes-a.votes})
var template = $('#template').html();
Mustache.parse(template);
var rendered = Mustache.render(template,{memeArray});
$('#memeBody').html(rendered);
}   

window.addEventListener('load',async () => {
    $("#loader").show();
    // initialize Aepp method from Ae object
    client = await Ae.Aepp();
    // make promised call to the blockchain contract functions
    const calledGet = await client.contractCallStatic(contractAddress,'sophia-address','getMemesLength',{args:'()'}).catch(e => console.error(e));
    console.log('calledGet',calledGet);
    const decodedGet = await client.contractDecodeData('int',calledGet.result.returnValue).catch(e => console.error(e));
    console.log('decodedGet',decodedGet.value);   
    
    renderMemes();

    $("#loader").hide();
});
// Koniec
// Zoberie tu hodnotu hlasu(ae) ktoru prave klika uzivatel, najde jej memem id na ktore klika  a prida hodnotu do memeArray
jQuery("#memeBody").on("click", ".voteBtn", async function(event){
    const value = $(this).siblings('input').val();
    const dataIndex = event.target.id;
    const foundIndex = memeArray.findIndex(meme => meme.index == dataIndex);
    memeArray[foundIndex].votes += parseInt(value, 10);
    renderMemes();


});
// na Register gombik klik vzkona async funkciu najde tu hodnotu regName a regUrl na ktoru klikam, priradi ich do premennych,pushne ich do memeArray a pripocite 1 k deterajsej dlzke memesArray{ co bude index novoregistrovaneho meme}
$('#registerBtn').click(async function(){
    var name = ($('#regName').val()),
        url = ($('#regUrl').val());

    memeArray.push({
        creatorName : name ,
        memeUrl : url,
        index : memeArray.length+1,
        votes : 0


    })
    renderMemes();

})
