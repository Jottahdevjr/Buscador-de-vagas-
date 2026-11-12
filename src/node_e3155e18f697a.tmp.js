const teste = async()=>{
    const res = await fetch("https://remotive.com/api/remote-jobs?category=software-dev&search=junior"
    );
    const dados = await res.json();
    console.log(dados.jobs[0]);
};

teste();