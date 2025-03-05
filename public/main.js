// submit form
const btn = document.querySelector('.submit-btn');
btn.addEventListener('click', async (e) => {
    e.preventDefault();

    const { data } = await axios.get('/api/users');
    console.log(data.rows);

});