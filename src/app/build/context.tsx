'use client';

import { Content } from '@prismicio/client';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type CustomizerControlsContext = {
    selectedWheel?: Content.BoardCustomizerDocumentDataWheelsItem;
    setWheel: (wheel: Content.BoardCustomizerDocumentDataWheelsItem) => void;
    selectedDeck?: Content.BoardCustomizerDocumentDataDecksItem;
    setDeck: (deck: Content.BoardCustomizerDocumentDataDecksItem) => void;
    selectedTruck?: Content.BoardCustomizerDocumentDataMetalsItem;
    setTruck: (truck: Content.BoardCustomizerDocumentDataMetalsItem) => void;
    selectedBolt?: Content.BoardCustomizerDocumentDataMetalsItem;
    setBolt: (bolt: Content.BoardCustomizerDocumentDataMetalsItem) => void;
};

const defaultContext: CustomizerControlsContext = {
    setWheel: () => {},
    setDeck: () => {},
    setTruck: () => {},
    setBolt: () => {},
};

const CustomizerControlsContext = createContext(defaultContext);

type CustomerControlsProviderProps = {
    defaultWheel?: Content.BoardCustomizerDocumentDataWheelsItem;
    defaultDeck?: Content.BoardCustomizerDocumentDataDecksItem;
    defaultTruck?: Content.BoardCustomizerDocumentDataMetalsItem;
    defaultBolt?: Content.BoardCustomizerDocumentDataMetalsItem;
    children?: ReactNode;
};

export function CustomizerControlsProvider({
    children,
    defaultWheel,
    defaultBolt,
    defaultDeck,
    defaultTruck,
}: CustomerControlsProviderProps) {
    const [selectedWheel, setWheel] = useState(defaultWheel);
    const [selectedDeck, setDeck] = useState(defaultDeck);
    const [selectedBolt, setBolt] = useState(defaultBolt);
    const [selectedTruck, setTruck] = useState(defaultTruck);

    const value = useMemo<CustomizerControlsContext>(() => {
        return {
            selectedWheel,
            setWheel,
            selectedBolt,
            setBolt,
            selectedDeck,
            setDeck,
            selectedTruck,
            setTruck,
        };
    }, [selectedWheel, selectedBolt, selectedDeck, selectedTruck]);

    return (
        <CustomizerControlsContext.Provider value={value}>
            {children}
        </CustomizerControlsContext.Provider>
    );
}

export function useCustomizerControls() {
    return useContext(CustomizerControlsContext);
}
