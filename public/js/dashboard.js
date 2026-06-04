const token = localStorage.getItem("token");

if(!token){

window.location.href = "/";

}
function showSection(sectionId){

    document
    .querySelectorAll(".section")
    .forEach(section => {
    
    section.classList.remove("active");
    
    });
    
    document
    .getElementById(sectionId)
    .classList.add("active");
    
    }
    
    async function loadStats(){
    
    try{
    
    const response = await fetch("/stats",{
    headers:{
    Authorization:
    localStorage.getItem("token")
    }
    });
    
    const data =
    await response.json();
    const username =
localStorage.getItem("username");

const referralInput =
document.getElementById(
"referralLink"
);

if(referralInput){

referralInput.value =
`${location.origin}/ref/${username}`;

}
    document.getElementById(
    "totalViews"
    ).innerText =
    data.totalViews || 0;
    
    document.getElementById(
    "totalEarnings"
    ).innerText =
    "$" +
    Number(
    data.totalEarnings || 0
    ).toFixed(4);
    
    document.getElementById(
    "averageCPM"
    ).innerText =
    "$" +
    Number(
    data.averageCPM || 0
    ).toFixed(2);
    
    document.getElementById(
    "totalLinks"
    ).innerText =
    data.totalLinks || 0;
    document.getElementById(
        "todayViews"
        ).innerText =
        data.todayViews || 0;
        
        document.getElementById(
        "todayEarnings"
        ).innerText =
        "$" +
        Number(
        data.todayEarnings || 0
        ).toFixed(4);
        if(data.bestLink){

            document.getElementById(
            "bestLink"
            ).innerHTML = `
            
            <a
            href="https://${location.host}/s/${data.bestLink.shortCode}"
            target="_blank">
            
            https://${location.host}/s/${data.bestLink.shortCode}
            
            </a>
            
            <br><br>
            
            ${data.bestLink.clicks} Views
            
            `;
            
            }
    document.getElementById(
    "balanceAmount"
    ).innerText =
    "$" +
    Number(
    data.totalEarnings || 0
    ).toFixed(4);
    
    }catch(error){
    
    console.log(error);
    
    }
    
    }
    
    async function loadLinks(){
    
    try{
    
    const response =
    await fetch("/my-links",{
    
    headers:{
    Authorization:
    localStorage.getItem("token")
    }
    
    });
    
    const links =
    await response.json();
    
    const table =
    document.getElementById(
    "linksTable"
    );
    
    if(!links.length){
    
    table.innerHTML = `
    <tr>
    <td colspan="4">
    No Links Yet
    </td>
    </tr>
    `;
    
    return;
    
    }
    
    table.innerHTML = "";
    
    links.forEach(link => {
    
    table.innerHTML += `
    <tr>
    
    <td>
    https://${location.host}/s/${link.shortCode}
    </td>
    
    <td>
    ${link.clicks}
    </td>
    
    <td>
    $${Number(
    link.earnings || 0
    ).toFixed(4)}
    </td>
    
    <td>
    
    <button
    class="delete-btn"
    onclick="deleteLink('${link._id}')">
    
    Delete
    
    </button>
    
    </td>
    
    </tr>
    `;
    
    });
    
    }catch(error){
    
    console.log(error);
    
    }
    
    }
    
    async function createLink(){
    
    const originalUrl =
    document.getElementById(
    "urlInput"
    ).value;
    
    if(!originalUrl){
    
    alert("Enter URL");
    
    return;
    
    }
    
    try{
    
    const response =
    await fetch("/shorten",{
    
    method:"POST",
    
    headers:{
    "Content-Type":
    "application/json",
    
    Authorization:
    localStorage.getItem("token")
    },
    
    body:JSON.stringify({
    originalUrl
    })
    
    });
    
    const data =
    await response.json();
    
    if(data.message &&
    !data.shortUrl){
    
    alert(data.message);
    
    return;
    
    }
    
    document.getElementById(
    "newLinkResult"
    ).innerHTML = `
    
    <p>
    ✅ Link Created
    </p>
    
    <br>
    
    <a href="${data.shortUrl}"
    target="_blank">
    
    ${data.shortUrl}
    
    </a>
    
    `;
    
    document.getElementById(
    "urlInput"
    ).value = "";
    
    loadLinks();
    loadStats();
    
    }catch(error){
    
    console.log(error);
    
    }
    
    }
    
    async function deleteLink(id){
    
    if(
    !confirm(
    "Delete this link?"
    )
    ){
    return;
    }
    
    try{
    
    await fetch(`/delete/${id}`,{
    
    method:"DELETE",
    
    headers:{
    Authorization:
    localStorage.getItem("token")
    }
    
    });
    
    loadLinks();
    loadStats();
    
    }catch(error){
    
    console.log(error);
    
    }
    
    }
    
    function logoutUser(){

        localStorage.clear();
        
        window.location.replace("/");
        
        }
    
    function checkLogin(){
    
    const token =
    localStorage.getItem("token");
    
    if(!token){
    
    window.location.href = "/";
    
    return;
    
    }
    
    const username =
    localStorage.getItem("username");
    
    const userElement =
    document.getElementById(
    "userName"
    );
    
    if(userElement){
    
    userElement.innerText =
    username || "User";
    
    }
    
    }
    
    checkLogin();
    loadStats();
    loadLinks();
    async function loadChart(){

        const ctx =
        document.getElementById(
        "statsChart"
        );
        
        if(!ctx) return;
        
        new Chart(ctx,{
        
        type:"bar",
        
        data:{
        
        labels:[
        "Views",
        "Links"
        ],
        
        datasets:[{
        
        label:"Statistics",
        
        data:[
        
        Number(
        document.getElementById(
        "totalViews"
        ).innerText
        ),
        
        Number(
        document.getElementById(
        "totalLinks"
        ).innerText
        )
        
        ]
        
        }]
        
        }
        
        });
        
        }
        
        setTimeout(
        loadChart,
        1000
        );