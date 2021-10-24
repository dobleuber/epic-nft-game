const main = async () => {
    const names = [
        'Alpha',
        'Beta',
        'Gamma',
        'Delta',
        'Omega',
    ];
    const images = [
        'https://drive.google.com/uc?id=1JkEtdfTbpMBjYJyGxeBK5T95LPZbnoGC',
        'https://drive.google.com/uc?id=1_zGfqtw3PooOvFYi7IudqhnwVKzxaZEr',
        'https://drive.google.com/uc?id=10qoc9-DYiGAwT28mjymkRQ06kLw_yq3W',
        'https://drive.google.com/uc?id=10GAT8V-4rwtywLcKwwhWMJowgm51vTna',
        'https://drive.google.com/uc?id=1H_cqhyozz5ZkdwV3InO01QPXIxBuSRdI',
    ];

    const hp = [200, 150, 300, 100, 80];
    const attacks = [80, 100, 50, 150, 200];

    const gameContractFactory = await hre.ethers.getContractFactory("MyEpicGame");
    const gameContract = await gameContractFactory.deploy(
        names,
        images,
        hp,
        attacks,
        "Big Boss",
        "https://drive.google.com/uc?id=1IwmZqmErti6txSZr9xFA8UH8xnBIyLx7",
        10000,
        50
    );
    await gameContract.deployed();

    console.log("Game deployed at: " + gameContract.address);

    // for(let i = 0; i < names.length; i++) {
    //     const txn = await gameContract.mint(i);
    //     await txn.wait();
    //     console.log("Minted NFT #", i+1);
    // }

    // boss image
    // https://drive.google.com/uc?id={ID}
}

main().then(() => {
    console.log("Done");
    process.exit(0);
}).catch((error) => {
    console.error(error);
    process.exit(1);
})