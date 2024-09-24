async function authenticate(user, pass) {
    const url = 'http://10.47.19.224:3852/auth';
    const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImlzaGVycmVyYSIsImlhdCI6MTcyNjE0OTcxOSwiZXhwIjoxNzI2MTUzMzE5fQ.VkPFSl1ULv-LLfht0xZTB3jllyDhGB_WZ5ZrME3F3TY';
    
    const data = {
        username: user,
        password: pass
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);

        // Retornar el resultado esperado
        return result;

    } catch (error) {
        console.error('Error during authentication:', error);
        return { message: 'Error en la autenticación', response: false }; // Retornar un objeto consistente
    }
}
module.exports = { authenticate }
