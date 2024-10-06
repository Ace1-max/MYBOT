const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt", "stat"],
    version: "1.1",
    author: "AceGerome",
    role: 0,
    category: "info",
    guide: {
      en: "Use {pn}"
    }
  },
  onStart: async function ({ message, api }) {
    const uptime = process.uptime();
    const formattedUptime = formatMilliseconds(uptime * 1000);

    const timeStart = Date.now();
    const pingMessage = await api.sendMessage("Pong!", api.getCurrentUserID());
    const ping = Date.now() - timeStart;
    let stat = ping < 400 ? "Good" : ping < 800 ? "Fair" : "Very Poor";

    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const diskUsage = await getDiskUsage();
    const cpuUsage = await getCpuUsage();

    const systemInfo = {
      os: `${os.type()} ${os.release()}`,
      arch: os.arch(),
      cpu: `${os.cpus()[0].model} (${os.cpus().length} cores)`,
      loadAvg: os.loadavg()[0],
      botUptime: formattedUptime,
      systemUptime: formatUptime(os.uptime()),
      processMemory: prettyBytes(process.memoryUsage().rss),
      ping: `[ ${stat} || ${ping}ms ]`,
      cpuUsage: cpuUsage + '%'
    };

    const response = `★ 𝐒𝐲𝐬𝐭𝐞𝐦 𝐎𝐯𝐞𝐫𝐯𝐢𝐞𝐰 ★\n`
      + '-------------------------------------\n'
      + '⚙  System Information:\n'
      + `  OS: ${systemInfo.os}\n`
      + `  Arch: ${systemInfo.arch}\n`
      + `  CPU: ${systemInfo.cpu}\n`
      + `  Load Avg: ${systemInfo.loadAvg}%\n`
      + `  CPU Usage: ${systemInfo.cpuUsage}\n`
      + '-------------------------------------\n'
      + `💾 Memory Information:\n`
      + `  Memory Usage: \n${prettyBytes(usedMemory)} / Total ${prettyBytes(totalMemory)}\n`
      + `  RAM Usage: \n${prettyBytes(totalMemory - freeMemory)} / Total ${prettyBytes(totalMemory)}\n`
      + '-------------------------------------\n'
      + `💿 Disk Space Information:\n`
      + `  Disk Space Usage: \n${prettyBytes(diskUsage.used)} / Total ${prettyBytes(diskUsage.total)}\n`
      + '-------------------------------------\n'
      + `🤖 Bot Uptime: ${systemInfo.botUptime}\n`
      + `⚙ Server Uptime: ${systemInfo.systemUptime}\n`
      + `📶 Ping: ${systemInfo.ping}\n`
      + `📊 Process Memory Usage: \n${systemInfo.processMemory}\n`
      + '-------------------------------------';

    message.reply(response);
  }
};

async function getDiskUsage() {
  const { stdout } = await exec('df -k /');
  const [_, total, used] = stdout.split('\n')[1].split(/\s+/).filter(Boolean);
  return { total: parseInt(total) * 1024, used: parseInt(used) * 1024 };
}

async function getCpuUsage() {
  const startMeasure = cpuAverage();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  const endMeasure = cpuAverage();
  const idleDifference = endMeasure.idle - startMeasure.idle;
  const totalDifference = endMeasure.total - startMeasure.total;
  const percentageCpu = 100 - ~~(100 * idleDifference / totalDifference);
  return percentageCpu;
}

function cpuAverage() {
  const cpus = os.cpus();
  let totalIdle = 0, totalTick = 0;

  cpus.forEach(cpu => {
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function formatMilliseconds(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
}

function prettyBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}
