const form = document.getElementById('prio');

issuesParser();
calctest();

form.addEventListener('submit', e => {
    e.preventDefault();
    grabber();
});

function giveError(message){
    const errorbox = document.getElementById('error-messages');
    
    errorbox.innerHTML = 
        '\
        <div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">\
        ' + message +  '\
        <button type=\"button\" class=\"close\" data-dismiss=\"alert\" id=\"alert\">\
            <span aria-hidden=\"true\">&times;</span>\
        </button>\
        </div>\
        ';
    throw Error(message);
    
}


function grabber(){
    var debug = "";
    var debugUpdate = document.getElementById('resultsDebug');
    // Segment
    var selectSegment = document.getElementById('inputSegment');
    var segment = selectSegment.value;
    debug += '<li class="list-group-item"> Segment: ' + segment + '</li>';

    if (segment == "0"){
        giveError("Please select segment!");
    }

    // Parcels per day 
    var selectParcels = document.getElementById('inputParcels');
    var parcels = selectParcels.value;
    debug += '<li class="list-group-item"> Parcels per day: ' + parcels + '</li>';

    if (parcels == "0"){
        giveError("Please select number of parcels!");
    }

    // Affected markets
    var checkboxesMarket = document.getElementsByName('inputMarket');
    var checkboxesMarketAll = document.getElementById('marketAll');
    var markets = "";
    for (var i=0, n=checkboxesMarket.length;i<n;i++) {
        if (checkboxesMarket[i].checked) {
        markets += ","+checkboxesMarket[i].value;
        }
    }
    if (markets) markets = markets.substring(1);
    if (checkboxesMarketAll.checked){
        markets = "All";
    }
    
    debug += '<li class="list-group-item"> Affected markets: ' + markets + '</li>';

    if (markets == ""){
        giveError("Please select market(s)!");
    }

    // Workaround
    var checkboxWorkaround = document.getElementById('hasWorkaround');
    var hasWorkaround;
    if (checkboxWorkaround.checked) {
        debug += '<li class="list-group-item">Workaround available</li>';
        hasWorkaround = true;
    }else{
        debug += '<li class="list-group-item">No workaround available</li>';
        hasWorkaround = false;
    }

    // Churn risk
    var checkboxChurnRisk = document.getElementById('hasChurnRisk');
    var hasChurnRisk;
    if (checkboxChurnRisk.checked) {
        debug += '<li class="list-group-item">Churn risk given</li>';
        hasChurnRisk = true;
    }else{
        debug += '<li class="list-group-item">No churn risk</li>';
        hasChurnRisk = false;
    }

    // Issue description
    var issue = document.getElementById('issuesDescription');
    var iDesc = issue.value;
    debug += '<li class="list-group-item"> Issue description: ' + iDesc + '</li>';

    if (iDesc == ""){
        giveError("Please select the issue description!");
    }

    // Issue grade
    var grade = document.getElementById('issuesGrade');
    var iGrade = grade.value;

    // click away error messages if given
    const error = document.getElementById('alert');
    if (error){
        error.click();
    }

    // show results container
    const results = document.getElementById('resultsContainer');
    results.style.display = "flex";

    calculation(segment, parcels, markets, iGrade, hasWorkaround, hasChurnRisk);
}

function calculation(seg, par, mar, grade, work, churn){
    var eq = "";
    const htmlResult = document.getElementById('realResult');
    const htmlRounded = document.getElementById('roundedResult');
    const htmlEq = document.getElementById('equation');
    const htmlEqEl = document.getElementById('equationElaborate');
    $.getJSON("grades.json", function(j){
        // Segment
        var s = j['seg'].multiplier * j['seg'][seg].weight;
        // Parcels
        var p = j['par'].multiplier * j['par'][par].weight;
        // Market
        var m = j['mar'].multiplier * j['mar'][mar].weight;
        // Issue grade (description not needed)
        var g = j['desc'].multiplier * grade;
        // Workaround
        if (work){
            var w = j['work'].multiplier * j['work'].available;
            var w_r = `<strong>${j['work'].multiplier}</strong> * ${j['work'].available}`;
        }else{
            var w = j['work'].multiplier * j['work'].notAvailable;
            var w_r = `<strong>${j['work'].multiplier}</strong> * ${j['work'].notAvailable}`;
        }
        // Churn risk
        if (churn){
            var c = j['churn'].multiplier * j['churn'].available;
            var c_r = `<strong>${j['churn'].multiplier}</strong> * ${j['churn'].available}`;
        }else{
            var c = j['churn'].multiplier * j['churn'].notAvailable;
            var c_r = `<strong>${j['churn'].multiplier}</strong> * ${j['churn'].notAvailable}`;
        }

        eq = s + p + m + g + w + c;
        console.log(eq);
        htmlResult.innerHTML = eq;
        htmlRounded.innerHTML = Math.round(eq);
        htmlEq.innerHTML = `
        <mark style="background-color: LavenderBlush;">${s}</mark> + \
        <mark style="background-color: LightCyan;">${p}</mark> + \
        <mark style="background-color: LightGoldenRodYellow;">${m}</mark> + \
        <mark style="background-color: LightSkyBlue;">${g}</mark> + \
        <mark style="background-color: Pink;">${w}</mark> + \
        <mark style="background-color: PaleGreen;">${c}</mark> = ${eq} \
        `;
        htmlEqEl.innerHTML = `
        <mark style="background-color: LavenderBlush;"><strong>${j['seg'].multiplier}</strong> * ${j['seg'][seg].weight}</mark>\
        <mark style="background-color: LightCyan;"><strong>${j['par'].multiplier}</strong> * ${j['par'][par].weight}</mark>\
        <mark style="background-color: LightGoldenRodYellow;"><strong>${j['mar'].multiplier}</strong> * ${j['mar'][mar].weight}</mark>\
        <mark style="background-color: LightSkyBlue;"><strong>${j['desc'].multiplier}</strong> * ${grade}</mark>\
        <mark style="background-color: Pink;">${w_r}</mark>\
        <mark style="background-color: PaleGreen;">${c_r}</mark>\
        `;
    });
}

function calctest(){
    $.getJSON("grades.json", function(json){
        console.log(json['seg']['S']);
    });
}

function issuesParser(){
    $.getJSON("grades.json", function(json){
        const issuesSelector = document.getElementById('issuesDescription');
        var issues = json['desc']['issues'];

        for (i=0; i < issues.length; i++){
            issuesSelector.innerHTML += `<option value=${issues[i].idName}>${issues[i].name}</option>`;
        }
    });
}

function issueGrader(sel){
    $.getJSON("grades.json", function(json){
        const issuesGrade = document.getElementById('issuesGrade');
        issuesGrade.innerHTML = "";
        issuesGrade.disabled = false;
        grades = json['desc']['issues'];
        for(i=0; i < grades[sel.selectedIndex].grades.length; i++){
            var html = "";
            html += `<option value=${grades[sel.selectedIndex].grades[i].gradeWeight}>${grades[sel.selectedIndex].grades[i].gradeName}</option>`;
            issuesGrade.innerHTML += html;
        }
    });


}