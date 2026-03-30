import {describe, expect, it} from 'vitest';
import {getLayoutedElements} from './graphUtils';

describe('graphUtils', () => {
    it('should return empty nodes and edges for null input', () => {
        const result = getLayoutedElements(null);
        expect(result.nodes).toEqual([]);
        expect(result.edges).toEqual([]);
    });

    it('should generate a root node for a simple object', () => {
        const data = {id: 1, name: 'Test'};
        const result = getLayoutedElements(data);

        expect(result.nodes.length).toBe(1);
        expect(result.nodes[0].data.label).toBe('root');
        expect(result.nodes[0].data.primitives).toEqual([
            {key: 'id', value: 1, type: 'number'},
            {key: 'name', value: 'Test', type: 'string'}
        ]);
    });

    it('should generate children nodes and edges for nested objects', () => {
        const data = {
            user: {
                name: 'Alice',
                address: {city: 'Porto'}
            }
        };
        const result = getLayoutedElements(data);

        // root, user, address
        expect(result.nodes.length).toBe(3);
        expect(result.edges.length).toBe(2);

        const rootNode = result.nodes.find(n => n.data.label === 'root');
        const userNode = result.nodes.find(n => n.data.label === 'user');
        const addressNode = result.nodes.find(n => n.data.label === 'address');

        expect(rootNode).toBeDefined();
        expect(userNode).toBeDefined();
        expect(addressNode).toBeDefined();

        // Check pathing
        expect(userNode?.data.path).toBe('root.user');
        expect(addressNode?.data.path).toBe('root.user.address');
    });

    it('should handle arrays correctly', () => {
        const data = {
            items: [
                {id: 1},
                {id: 2}
            ]
        };
        const result = getLayoutedElements(data);

        // root, items [], node-0, node-1
        expect(result.nodes.length).toBe(4);

        const itemsNode = result.nodes.find(n => n.data.label === 'items []');
        expect(itemsNode).toBeDefined();
        expect(itemsNode?.data.isArray).toBe(true);
    });

    it('should truncate long strings', () => {
        const longString = 'A'.repeat(50);
        const data = {long: longString};
        const result = getLayoutedElements(data);

        const value = result.nodes[0].data.primitives[0].value;
        expect(typeof value).toBe('string');
        expect((value as string).length).toBeLessThan(longString.length);
        expect((value as string).endsWith('…')).toBe(true);
    });
});
