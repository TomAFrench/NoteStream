import instance from '../utils/instance';

export default function migrate({
    onError,
    onClose,
} = {}) {
    return instance(
        'truffle compile --all && truffle migrate --reset',
        {
            onError,
            onClose,
        },
    );
}
