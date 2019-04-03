
//const contractAddress ='ct_2qcqwwXmfLmZ3a18yvnv4p8ta9HGoyHRjCDvPMvyAqkuMRwzPD';
const contractAddress = 'ct_25qpLuCMTPKgK8mKzTrYLRqJzdnY9xjJ6Sr2eee9mf9ztm5enx';
var client = null;
var memeArray = [];
var memesLength = 0;

// var memeArray = [
//         {"creatorName":"Alice","memeUrl":"https://pbs.twimg.com/media/Dsdt6gOXcAAksLu.jpg","votes":18,"index":1,"rank":1},
//         {"creatorName":"Bob","memeUrl":"https://pbs.twimg.com/media/C4Vu1S0WYAA3Clw.jpg","votes":27,"index":2,"rank":2},
//         {"creatorName":"Carol","memeUrl":"https://pbs.twimg.com/media/DeHbsSAU0AAbQAq.jpg","votes":18,"index":3,"rank":3}
//     ]

// Toto treba abz mustache renderov časť ktorá je v index.html,zobrazi aj memečka 

function renderMemes() {
  memeArray = memeArray.sort(function(a,b){return b.votes-a.votes})
  var template = $('#template').html();
  Mustache.parse(template);
  var rendered = Mustache.render(template, {memeArray});
  $('#memeBody').html(rendered);
}

async function callStatic(func, args, types) {
  const calledGet = await client.contractCallStatic(contractAddress,
  'sophia-address', func, {args}).catch(e => console.error(e));

  const decodedGet = await client.contractDecodeData(types,
  calledGet.result.returnValue).catch(e => console.error(e));

  return decodedGet;
}

async function contractCall(func, args, value, types) {
  const calledSet = await client.contractCall(contractAddress, 'sophia-address',
  contractAddress, func, {args, options: {amount:value}}).catch(async e => {
    const decodedError = await client.contractDecodeData(types,
    e.returnValue).catch(e => console.error(e));
  });

  return
}


window.addEventListener('load', async () => {
  $("#loader").show();

  client = await Ae.Aepp();

  const getMemesLength = await callStatic('getMemesLength','()','int');
  memesLength = getMemesLength.value;

  for (let i = 1; i <= memesLength; i++) {
    const meme = await callStatic('getMeme',`(${i})`,'(address, string, string, int)');

    memeArray.push({
      creatorName: meme.value[2].value,
      memeUrl: meme.value[1].value,
      index: i,
      votes: meme.value[3].value,
    })
  }

  renderMemes();

  $("#loader").hide();
});

// Koniec
// Zoberie tu hodnotu hlasu(ae) ktoru prave klika uzivatel, najde jej memem id na ktore klika  a prida hodnotu do memeArray

jQuery("#memeBody").on("click", ".voteBtn", async function(event){
  $("#loader").show();

  const value = $(this).siblings('input').val();
  const dataIndex = event.target.id;

  await contractCall('voteMeme',`(${dataIndex})`,value,'(int)');

  const foundIndex = memeArray.findIndex(meme => meme.index == dataIndex);
  memeArray[foundIndex].votes += parseInt(value, 10);

  renderMemes();

  $("#loader").hide();
});
// na Register gombik klik vzkona async funkciu najde tu hodnotu regName a regUrl na ktoru klikam, priradi ich do premennych,pushne ich do memeArray a pripocite 1 k deterajsej dlzke memesArray{ co bude index novoregistrovaneho meme}
$('#registerBtn').click(async function(){
  $("#loader").show();

  const name = ($('#regName').val()),
        url = ($('#regUrl').val());

  await contractCall('registerMeme',`("${url}","${name}")`,0,'(int)');

  memeArray.push({
    creatorName: name,
    memeUrl: url,
    index: memeArray.length+1,
    votes: 0
  })

  renderMemes();

  $("#loader").hide();
});
