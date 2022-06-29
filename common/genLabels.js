function genLabels(labels, labelCount = 3) {
    if (labels) {
        let all = [];
        Array.from(labels).forEach(label => {
            let quantity = parseInt(label.banQuantity)
            let count = 1
            while (count <= quantity) {
                for (let i = 0; i < labelCount; i++) {
                    let labelDate = label.date.split('-');
                    all.push([
                        label.clientNumber,
                        label.destination + '(' + count + '/' + quantity + ')',
                        labelDate[1] + '-' + labelDate[2] + '-' + labelDate[0]
                    ]);
                }
                count += 1
            }
        });
        return all;
    }
}
