function formatRp(valuation) {
    return `Rp ${valuation.toLocaleString('id-ID')},00`
}

module.exports = { formatRp }