import React from "react";
import { HPMPContainer } from "../ui/HPMPContainer";
import { MinimapContainer } from "../ui/MinimapContainer";
import { UIContainerModifier } from "../ui/UIContainerModifier";
import { withContainerModifier } from "../ui/UIContainerModifier";

/**
 * ContainerModifierDemo - Single Responsibility: Demonstrate container modifier usage
 * SOLID: Shows composition over inheritance in action
 * Pattern: Standard TypeScript/React composition patterns
 */
const ContainerModifierDemo: React.FC = () => {
  return (
    <div className="p-6 space-y-8 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">
        Container Modifier Demo
      </h1>

      {/* Section 1: HP/MP Container Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">HP/MP Container Examples</h2>
        
        {/* Basic HP/MP with content wrapping */}
        <div className="flex space-x-4">
          <HPMPContainer 
            wrapContent={true}
            maxWidth="300px"
            className="bg-blue-900/20 border-blue-500/30"
          >
            <div className="text-xs text-blue-200 p-2 bg-blue-900/30 rounded">
              Additional stats info can go here
            </div>
          </HPMPContainer>

          {/* HP/MP without content wrapping (base component) */}
          <HPMPContainer wrapContent={false} />
        </div>
      </section>

      {/* Section 2: Minimap Container Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Minimap Container Examples</h2>
        
        {/* Minimap with legend and controls */}
        <div className="flex space-x-4">
          <MinimapContainer 
            showLegend={true}
            showControls={true}
            maxWidth="250px"
            className="bg-green-900/20 border-green-500/30"
          />

          {/* Minimap with custom content */}
          <MinimapContainer 
            maxWidth="200px"
            className="bg-purple-900/20 border-purple-500/30"
          >
            <div className="text-xs text-purple-200 p-2 bg-purple-900/30 rounded">
              Custom minimap content
            </div>
          </MinimapContainer>
        </div>
      </section>

      {/* Section 3: Generic Container Modifier Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Generic Container Modifier Examples</h2>
        
        {/* Basic content wrapping */}
        <UIContainerModifier
          wrapContent={true}
          maxWidth="400px"
          padding="16px"
          backgroundColor="rgba(255, 0, 0, 0.1)"
          borderColor="rgba(255, 0, 0, 0.3)"
          borderRadius="12px"
          glassmorphism={true}
        >
          <div className="text-white">
            <h3 className="text-lg font-semibold mb-2">Generic Content Wrapper</h3>
            <p>This content is wrapped with the generic container modifier.</p>
            <p>It can contain any type of content and apply various styling options.</p>
          </div>
        </UIContainerModifier>

        {/* Floating animation example */}
        <UIContainerModifier
          wrapContent={true}
          maxWidth="300px"
          padding="12px"
          backgroundColor="rgba(0, 255, 0, 0.1)"
          borderColor="rgba(0, 255, 0, 0.3)"
          borderRadius="8px"
          floating={true}
          animationDuration="2s"
        >
          <div className="text-white text-center">
            <h3 className="text-lg font-semibold">Floating Container</h3>
            <p>This container has a floating animation effect.</p>
          </div>
        </UIContainerModifier>
      </section>

      {/* Section 4: Higher-Order Component Example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Higher-Order Component Example</h2>
        
        {/* Example of using withContainerModifier */}
        <div className="text-white">
          <p className="mb-2">
            You can also use the higher-order component pattern:
          </p>
          <code className="block bg-gray-800 p-3 rounded text-sm">
            {`const EnhancedComponent = withContainerModifier(BaseComponent, {
  glassmorphism: true,
  maxWidth: '300px'
});`}
          </code>
        </div>
      </section>

      {/* Section 5: Usage Guidelines */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Usage Guidelines</h2>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Key Benefits:</h3>
          <ul className="text-gray-300 space-y-1 text-sm">
            <li>• <strong>Zero Impact:</strong> Base components remain unchanged</li>
            <li>• <strong>Composition:</strong> Use composition over inheritance</li>
            <li>• <strong>Flexibility:</strong> Easy to add/remove features</li>
            <li>• <strong>Reusability:</strong> Modifiers can be applied to any component</li>
            <li>• <strong>Maintainability:</strong> Clear separation of concerns</li>
          </ul>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Pattern Usage:</h3>
          <ul className="text-gray-300 space-y-1 text-sm">
            <li>• <strong>wrapContent:</strong> Toggle content wrapping on/off</li>
            <li>• <strong>maxWidth/maxHeight:</strong> Control container dimensions</li>
            <li>• <strong>glassmorphism:</strong> Apply glassmorphism effects</li>
            <li>• <strong>floating:</strong> Add floating animations</li>
            <li>• <strong>Custom styling:</strong> Override any CSS property</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default ContainerModifierDemo;
