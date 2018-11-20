module.exports = shipit => {
  shipit.initConfig({
    default: {
      servers: 'root@128.199.60.164',
      key: 'private_key'
    }
  })

  shipit.task('eos:dependencies', async () => {
    await shipit.remote('apt-get install -y pkg-config libzmq5-dev')
  })
  shipit.task('eos:clone', async () => {
    await shipit.remote('cd /volume')
    await shipit.remote('git clone https://github.com/mmcs85/eos')
  })
  shipit.task('eos:build', async () => {
    await shipit.remote('cd /volume/eos')
    await shipit.remote('./eosio_build.sh')
  })
  shipit.task('eos:install', async () => {
    await shipit.remote('cd /volume/eos')
    await shipit.remote('./eosio_install.sh')
  })
  shipit.task('eos:install', async () => {
    await shipit.remote('cd /volume/eos')
    await shipit.remote('./eosio_uninstall.sh')
  })
  shipit.task('eos:start', async () => {
    await shipit.local(
      `nodeos -e -p eosio -d /volume/data \
      --config-dir /volume/config
      --plugin eosio::producer_plugin \
      --plugin eosio::chain_api_plugin \
      --plugin eosio::http_plugin \
      --http-server-address=0.0.0.0:8888 \
      --http-validate-host=false \
      --access-control-allow-origin=* \
      --contracts-console \
      --verbose-http-errors \
      >>/volume/data/nodeos.log 2>&1 \
      & echo $! > /volume/data/nodeos.pid`
    )
  })
  shipit.task('eos:replay', async () => {
    await shipit.local(
      `nodeos -e -p eosio -d /volume/data \
      --config-dir /volume/config
      --replay-hard
      --plugin eosio::producer_plugin \
      --plugin eosio::chain_api_plugin \
      --plugin eosio::http_plugin \
      --http-server-address=0.0.0.0:8888 \
      --http-validate-host=false \
      --access-control-allow-origin=* \
      --contracts-console \
      --verbose-http-errors \
      >>/volume/data/nodeos.log 2>&1 \
      & echo $! > /volume/data/nodeos.pid`
    )
  })
  shipit.task('eos:stop', async () => {
    shipit.local('kill -9 $(cat /volume/data/nodeos.pid) || true')
  })
  shipit.task('eos:reset', ['eos:stop'], async () => {
    shipit.local('rm -rf /volume/data && mkdir -p /volume/data')
  })
}
