import { atom, useAtom } from 'jotai';

const modalAtom = atom(false);

export const createChannelModalAtom = () => {
    return useAtom(modalAtom);
};