import {beforeEach, describe, expect, it} from 'vitest';
import {useSchemaStore} from './schemaStore';
import {act} from 'react';

describe('schemaStore', () => {
    beforeEach(() => {
        // Reset store to initial state if needed
        // Zustand's persist middleware might keep state between tests, but for unit tests we can just set values
        act(() => {
            useSchemaStore.getState().setJsonInput('{}');
            useSchemaStore.getState().setTargetLanguage('typescript');
            useSchemaStore.getState().setSelectedNodePath(null);
        });
    });

    it('should initialize with default sample JSON', () => {
        const state = useSchemaStore.getState();
        expect(state.jsonInput).toBeDefined();
        expect(state.parsedData).toBeDefined();
        expect(state.parseError).toBeNull();
    });

    it('should parse valid JSON input', () => {
        const input = '{"test": 123}';
        act(() => {
            useSchemaStore.getState().setJsonInput(input);
        });

        const state = useSchemaStore.getState();
        expect(state.jsonInput).toBe(input);
        expect(state.parsedData).toEqual({test: 123});
        expect(state.parseError).toBeNull();
    });

    it('should set error message for invalid JSON', () => {
        const input = '{"test": 123'; // Missing closing brace
        act(() => {
            useSchemaStore.getState().setJsonInput(input);
        });

        const state = useSchemaStore.getState();
        expect(state.jsonInput).toBe(input);
        expect(state.parsedData).toBeNull();
        expect(state.parseError).not.toBeNull();
    });

    it('should update target language', () => {
        act(() => {
            useSchemaStore.getState().setTargetLanguage('java');
        });

        expect(useSchemaStore.getState().targetLanguage).toBe('java');
    });

    it('should toggle dark mode', () => {
        const initialDark = useSchemaStore.getState().isDark;
        act(() => {
            useSchemaStore.getState().toggleDarkMode();
        });

        expect(useSchemaStore.getState().isDark).toBe(!initialDark);
    });

    it('should clear JSON input', () => {
        act(() => {
            useSchemaStore.getState().setJsonInput('{"a": 1}');
            useSchemaStore.getState().clearJsonInput();
        });

        const state = useSchemaStore.getState();
        expect(state.jsonInput).toBe('');
        expect(state.parsedData).toBeNull();
        expect(state.selectedNodePath).toBeNull();
    });
});
