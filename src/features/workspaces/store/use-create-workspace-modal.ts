import { atom, useAtom } from 'jotai';

const modalAtom = atom(false);

export const createWorkspaceModalAtom = () => {
    return useAtom(modalAtom);
};