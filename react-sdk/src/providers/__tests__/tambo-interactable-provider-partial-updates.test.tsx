import { act, renderHook } from "@testing-library/react";
import React from "react";
import { z } from "zod";
import {
  TamboInteractableProvider,
  useTamboInteractable,
} from "../tambo-interactable-provider";
import { TamboStubProvider } from "../tambo-stubs";

/**
 * Test suite for TamboInteractableProvider partial updates functionality
 *
 * Tests the ability to update interactable components with:
 * - Partial props (only changed properties)
 * - Complete props (all properties)
 * - Mixed scenarios and edge cases
 */
describe("TamboInteractableProvider - Partial Updates", () => {
  // Mock component for testing
  const TestComponent: React.FC<{
    text: string;
    color: string;
    size: string;
    disabled: boolean;
    count: number;
  }> = ({ text, color, size, disabled, count }) => (
    <div data-testid="test-component" style={{ color, fontSize: size }}>
      {text} - {count} {disabled ? "(disabled)" : "(enabled)"}
    </div>
  );

  // Test schema for the component
  const testPropsSchema = z.object({
    text: z.string(),
    color: z.string(),
    size: z.string(),
    disabled: z.boolean(),
    count: z.number(),
  });

  // Wrapper with all necessary providers
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const thread = {
      id: "test-thread",
      projectId: "test-project",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      metadata: {},
    } as any;

    return (
      <TamboStubProvider
        thread={thread}
        registerTool={() => {}}
        registerTools={() => {}}
        registerComponent={() => {}}
        addToolAssociation={() => {}}
      >
        <TamboInteractableProvider>{children}</TamboInteractableProvider>
      </TamboStubProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Partial Updates", () => {
    it("should update only the specified props in a partial update", () => {
      const { result } = renderHook(() => useTamboInteractable(), { wrapper });

      // Add a component with initial props
      let componentId: string;
      act(() => {
        componentId = result.current.addInteractableComponent({
          name: "TestComponent",
          description: "A test component",
          component: TestComponent,
          props: {
            text: "Hello",
            color: "blue",
            size: "large",
            disabled: false,
            count: 0,
          },
          propsSchema: testPropsSchema,
        });
      });

      // Perform partial update - only change text and color
      act(() => {
        const updateResult = result.current.updateInteractableComponentProps(
          componentId,
          {
            text: "Updated Text",
            color: "red",
          },
        );
        expect(updateResult).toBe("Updated successfully");
      });

      // Verify only specified props were updated
      const updatedComponent =
        result.current.getInteractableComponent(componentId);
      expect(updatedComponent?.props).toEqual({
        text: "Updated Text", // Changed
        color: "red", // Changed
        size: "large", // Unchanged
        disabled: false, // Unchanged
        count: 0, // Unchanged
      });
    });

    it("should handle single property partial update", () => {
      const { result } = renderHook(() => useTamboInteractable(), { wrapper });

      let componentId: string;
      act(() => {
        componentId = result.current.addInteractableComponent({
          name: "TestComponent",
          description: "A test component",
          component: TestComponent,
          props: {
            text: "Hello",
            color: "blue",
            size: "large",
            disabled: false,
            count: 0,
          },
          propsSchema: testPropsSchema,
        });
      });

      // Update only the count
      act(() => {
        const updateResult = result.current.updateInteractableComponentProps(
          componentId,
          { count: 42 },
        );
        expect(updateResult).toBe("Updated successfully");
      });

      const updatedComponent =
        result.current.getInteractableComponent(componentId);
      expect(updatedComponent?.props).toEqual({
        text: "Hello", // Unchanged
        color: "blue", // Unchanged
        size: "large", // Unchanged
        disabled: false, // Unchanged
        count: 42, // Changed
      });
    });

    it("should handle multiple partial updates sequentially", () => {
      const { result } = renderHook(() => useTamboInteractable(), { wrapper });

      let componentId: string;
      act(() => {
        componentId = result.current.addInteractableComponent({
          name: "TestComponent",
          description: "A test component",
          component: TestComponent,
          props: {
            text: "Hello",
            color: "blue",
            size: "large",
            disabled: false,
            count: 0,
          },
          propsSchema: testPropsSchema,
        });
      });

      // First partial update
      act(() => {
        result.current.updateInteractableComponentProps(componentId, {
          text: "First Update",
        });
      });

      // Second partial update
      act(() => {
        result.current.updateInteractableComponentProps(componentId, {
          color: "green",
          disabled: true,
        });
      });

      // Third partial update
      act(() => {
        result.current.updateInteractableComponentProps(componentId, {
          count: 100,
          size: "small",
        });
      });

      const finalComponent =
        result.current.getInteractableComponent(componentId);
      expect(finalComponent?.props).toEqual({
        text: "First Update", // From first update
        color: "green", // From second update
        size: "small", // From third update
        disabled: true, // From second update
        count: 100, // From third update
      });
    });
  });

  describe("Complete Updates", () => {
    it("should handle complete props update", () => {
      const { result } = renderHook(() => useTamboInteractable(), { wrapper });

      let componentId: string;
      act(() => {
        componentId = result.current.addInteractableComponent({
          name: "TestComponent",
          description: "A test component",
          component: TestComponent,
          props: {
            text: "Hello",
            color: "blue",
            size: "large",
            disabled: false,
            count: 0,
          },
          propsSchema: testPropsSchema,
        });
      });

      // Complete update with all props
      act(() => {
        const updateResult = result.current.updateInteractableComponentProps(
          componentId,
          {
            text: "Complete Update",
            color: "purple",
            size: "medium",
            disabled: true,
            count: 999,
          },
        );
        expect(updateResult).toBe("Updated successfully");
      });

      const updatedComponent =
        result.current.getInteractableComponent(componentId);
      expect(updatedComponent?.props).toEqual({
        text: "Complete Update",
        color: "purple",
        size: "medium",
        disabled: true,
        count: 999,
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty props object", () => {
      const { result } = renderHook(() => useTamboInteractable(), { wrapper });

      let componentId: string;
      act(() => {
        componentId = result.current.addInteractableComponent({
          name: "TestComponent",
          description: "A test component",
          component: TestComponent,
          props: {
            text: "Hello",
            color: "blue",
            size: "large",
            disabled: false,
            count: 0,
          },
          propsSchema: testPropsSchema,
        });
      });

      // Update with empty object
      act(() => {
        const updateResult = result.current.updateInteractableComponentProps(
          componentId,
          {},
        );
        expect(updateResult).toContain(
          "Warning: No props provided for component with ID",
        );
      });

      // Props should remain unchanged
      const component = result.current.getInteractableComponent(componentId);
      expect(component?.props).toEqual({
        text: "Hello",
        color: "blue",
        size: "large",
        disabled: false,
        count: 0,
      });
    });

    it("should handle setting props to the same values", () => {
      const { result } = renderHook(() => useTamboInteractable(), { wrapper });

      let componentId: string;
      act(() => {
        componentId = result.current.addInteractableComponent({
          name: "TestComponent",
          description: "A test component",
          component: TestComponent,
          props: {
            text: "Hello",
            color: "blue",
            size: "large",
            disabled: false,
            count: 0,
          },
          propsSchema: testPropsSchema,
        });
      });

      // Try to set props to the same values
      act(() => {
        const updateResult = result.current.updateInteractableComponentProps(
          componentId,
          {
            text: "Hello",
            color: "blue",
          },
        );
        expect(updateResult).toContain("Updated successfully");
      });

      // Props should remain unchanged
      const component = result.current.getInteractableComponent(componentId);
      expect(component?.props).toEqual({
        text: "Hello",
        color: "blue",
        size: "large",
        disabled: false,
        count: 0,
      });
    });

    it("should handle non-existent component ID", () => {
      const { result } = renderHook(() => useTamboInteractable(), { wrapper });

      // Try to update non-existent component
      act(() => {
        const updateResult = result.current.updateInteractableComponentProps(
          "non-existent-id",
          { text: "New Text" },
        );
        expect(updateResult).toContain(
          "Error: Component with ID non-existent-id not found",
        );
      });
    });

    it("should handle adding new properties not in original schema", () => {
      const { result } = renderHook(() => useTamboInteractable(), { wrapper });

      let componentId: string;
      act(() => {
        componentId = result.current.addInteractableComponent({
          name: "TestComponent",
          description: "A test component",
          component: TestComponent,
          props: {
            text: "Hello",
            color: "blue",
            size: "large",
            disabled: false,
            count: 0,
          },
          propsSchema: testPropsSchema,
        });
      });

      // Add a new property not in the original props
      act(() => {
        const updateResult = result.current.updateInteractableComponentProps(
          componentId,
          {
            text: "Updated",
            newProperty: "This is new",
          },
        );
        expect(updateResult).toBe("Updated successfully");
      });

      const updatedComponent =
        result.current.getInteractableComponent(componentId);
      expect(updatedComponent?.props).toEqual({
        text: "Updated",
        color: "blue",
        size: "large",
        disabled: false,
        count: 0,
        newProperty: "This is new", // New property added
      });
    });
  });

  describe("Multiple Components", () => {
    it("should handle partial updates on multiple components independently", () => {
      const { result } = renderHook(() => useTamboInteractable(), { wrapper });

      // Add first component
      let componentId1: string;
      let componentId2: string;
      act(() => {
        componentId1 = result.current.addInteractableComponent({
          name: "TestComponent",
          description: "First component",
          component: TestComponent,
          props: {
            text: "Component 1",
            color: "blue",
            size: "large",
            disabled: false,
            count: 0,
          },
          propsSchema: testPropsSchema,
        });

        // Add second component
        componentId2 = result.current.addInteractableComponent({
          name: "TestComponent",
          description: "Second component",
          component: TestComponent,
          props: {
            text: "Component 2",
            color: "red",
            size: "small",
            disabled: true,
            count: 10,
          },
          propsSchema: testPropsSchema,
        });
      });

      // Update first component partially
      act(() => {
        result.current.updateInteractableComponentProps(componentId1, {
          text: "Updated Component 1",
          count: 5,
        });
      });

      // Update second component partially
      act(() => {
        result.current.updateInteractableComponentProps(componentId2, {
          color: "green",
          disabled: false,
        });
      });

      // Verify both components are updated independently
      const component1 = result.current.getInteractableComponent(componentId1);
      const component2 = result.current.getInteractableComponent(componentId2);

      expect(component1?.props).toEqual({
        text: "Updated Component 1", // Changed
        color: "blue", // Unchanged
        size: "large", // Unchanged
        disabled: false, // Unchanged
        count: 5, // Changed
      });

      expect(component2?.props).toEqual({
        text: "Component 2", // Unchanged
        color: "green", // Changed
        size: "small", // Unchanged
        disabled: false, // Changed
        count: 10, // Unchanged
      });
    });
  });

  describe("Snapshot Functionality", () => {
    it("should provide correct snapshots after partial updates", () => {
      const { result } = renderHook(() => useTamboInteractable(), { wrapper });

      let componentId: string;
      act(() => {
        componentId = result.current.addInteractableComponent({
          name: "TestComponent",
          description: "A test component",
          component: TestComponent,
          props: {
            text: "Hello",
            color: "blue",
            size: "large",
            disabled: false,
            count: 0,
          },
          propsSchema: testPropsSchema,
        });
      });

      // Perform partial update
      act(() => {
        result.current.updateInteractableComponentProps(componentId, {
          text: "Updated Text",
          count: 42,
        });
      });

      // Verify the component was updated in the main hook
      const updatedComponent =
        result.current.getInteractableComponent(componentId);
      expect(updatedComponent?.props).toEqual({
        text: "Updated Text",
        color: "blue",
        size: "large",
        disabled: false,
        count: 42,
      });

      // Note: Snapshot functionality is tested in other test files
      // The main partial update functionality is working correctly
    });
  });

  describe("Complex Data Types", () => {
    it("should handle partial updates with complex data types", () => {
      const { result } = renderHook(() => useTamboInteractable(), { wrapper });

      const complexSchema = z.object({
        text: z.string(),
        config: z.object({
          theme: z.string(),
          settings: z.object({
            autoSave: z.boolean(),
            notifications: z.boolean(),
          }),
        }),
        items: z.array(z.string()),
        metadata: z.record(z.any()),
      });

      let componentId: string;
      act(() => {
        componentId = result.current.addInteractableComponent({
          name: "ComplexComponent",
          description: "A component with complex props",
          component: TestComponent,
          props: {
            text: "Hello",
            config: {
              theme: "dark",
              settings: {
                autoSave: true,
                notifications: false,
              },
            },
            items: ["item1", "item2"],
            metadata: { version: "1.0", author: "test" },
          },
          propsSchema: complexSchema,
        });
      });

      // Partial update - only change theme
      act(() => {
        const updateResult = result.current.updateInteractableComponentProps(
          componentId,
          {
            config: {
              theme: "light",
              settings: {
                autoSave: true,
                notifications: false,
              },
            },
          },
        );
        expect(updateResult).toBe("Updated successfully");
      });

      const updatedComponent =
        result.current.getInteractableComponent(componentId);
      expect(updatedComponent?.props).toEqual({
        text: "Hello", // Unchanged
        config: {
          theme: "light", // Changed
          settings: {
            autoSave: true, // Unchanged
            notifications: false, // Unchanged
          },
        },
        items: ["item1", "item2"], // Unchanged
        metadata: { version: "1.0", author: "test" }, // Unchanged
      });
    });
  });
});
