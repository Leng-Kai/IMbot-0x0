const https = require('https')
const { server_log_webhook, server_log_webhook_host, server_log_webhook_path } = require('./config.json');

module.exports = {
    discord_log(message) {
        const data = JSON.stringify({
            content: message
        });

        const options = {
            hostname: server_log_webhook_host,
            port: 443,
            path: server_log_webhook_path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, res => {
            res.on('data', d => {
                process.stdout.write(d);
            })
        });

        req.write(data);
        req.end();
    }
}