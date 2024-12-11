#!/bin/bash

start() {
    echo "Запуск candy machine и candy guard"

    sugar launch

    echo "Candy machine запущена"

    sugar guard add

    echo "Candy guard запущен"
}

update() {
    echo "Обновление конфигурации..."

    sugar guard update

    echo "Конфигурация успешно обновлена."
}

withdraw() {
    sugar guard withdraw

    sugar withdraw

    rm cache.json
}

public-mint() {
    npm run mint public
}

private-mint() {
    npm run mint private
}

tree-hash() {
    npm run tree-hash
}

show_help() {
    echo "  ./minter.sh start - Запускает процесс создания candy machine и candy guard"
    echo "  ./minter.sh update - Обновляет candy guard"
    echo "  ./minter.sh withdraw - Withdraw candy guard и candy machine"
    echo "  ./minter.sh private-mint - Private mint nft"
    echo "  ./minter.sh public-mint - Public mint nft"
    echo "  ./minter.sh tree-hash - Tree hash of allow list"
    echo "  ./minter.sh --help"
}

if [ $# -eq 0 ]; then
    echo "Ошибка: отсутствуют аргументы."
    show_help
    exit 1
fi

COMMAND=""
while [[ $# -gt 0 ]]; do
    case $1 in
        start|update|withdraw|private-mint|public-mint|tree-hash)
            COMMAND=$1
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "Ошибка: неизвестный аргумент '$1'."
            show_help
            exit 1
            ;;
    esac
done

case $COMMAND in
    start)
        start
        ;;
    update)
        update
        ;;
    withdraw)
        withdraw
        ;;
    private-mint)
        private-mint
        ;;
    public-mint)
        public-mint
        ;;
    tree-hash)
        tree-hash
        ;;
    *)
        echo "Ошибка: команда не указана или некорректна."
        show_help
        exit 1
        ;;
esac
