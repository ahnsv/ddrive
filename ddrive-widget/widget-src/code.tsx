const { widget } = figma;
const { AutoLayout, Text, Rectangle, useSyncedState, SVG, Input } = widget;

// Status color mapping
const STATUS_COLORS = {
  'todo': '#6B7280', // Gray
  'in-progress': '#3B82F6', // Blue
  'done': '#10B981', // Green
  'cancelled': '#EF4444' // Red
};

function Widget() {
  const [trackingData, setTrackingData] = useSyncedState<{
    eventName: string;
    properties: Array<{
      name: string;
      type: string;
      description: string;
    }>;
    status: keyof typeof STATUS_COLORS;
  } | null>('trackingData', null);

  const [pos, setPos] = useSyncedState('pos', { x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useSyncedState('isExpanded', false);

  const openUI = async (existingData: typeof trackingData) => {
    const center = figma.viewport.center;
    if (!trackingData) {
      setPos({ x: center.x, y: center.y });
    }

    await new Promise((resolve) => {
      figma.showUI(__html__, { width: 500, height: 600 });
      
      // Send existing data to UI if editing
      if (existingData) {
        figma.ui.postMessage({ 
          type: "edit-tracking-plan",
          data: existingData
        });
      }

      figma.ui.on("message", (msg) => {
        if (msg.type === "close") {
          figma.closePlugin();
          resolve(void 0);
        } else if (msg.type === "create-tracking-plan") {
          const { eventName, properties, currentStatus } = msg;
          setTrackingData({
            eventName,
            properties,
            status: currentStatus
          });
          resolve(void 0);
        }
      });
    });
  };

  if (!trackingData) {
    return (
      <AutoLayout
        direction="vertical"
        spacing={8}
        padding={8}
        onClick={() => openUI(null)}
      >
        <SVG
          src={`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="15.5" stroke="black" stroke-opacity="0.1" fill="white"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M17 8H15V15H8V17H15V24H17V17H24V15H17V8Z" fill="black" fill-opacity="0.8"/>
            </svg>
          `}
        />
      </AutoLayout>
    );
  }

  // Compact view (default)
  if (!isExpanded) {
    return (
      <AutoLayout
        x={pos.x}
        y={pos.y}
        direction="horizontal"
        spacing={8}
        padding={8}
        fill="#FFFFFF"
        stroke="#E6E6E6"
        cornerRadius={8}
        verticalAlignItems="center"
        onClick={() => setIsExpanded(true)}
        effect={{
          type: "drop-shadow",
          color: { r: 0, g: 0, b: 0, a: 0.1 },
          offset: { x: 0, y: 2 },
          blur: 4,
          spread: 0,
        }}
      >
        <Text fontSize={12} fontWeight="bold">{trackingData.eventName}</Text>
        <AutoLayout
          fill={STATUS_COLORS[trackingData.status]}
          padding={{ horizontal: 8, vertical: 4 }}
          cornerRadius={4}
          verticalAlignItems="center"
        >
          <Text fontSize={10} fill="#FFFFFF" fontWeight="bold">
            {trackingData.status.toUpperCase()}
          </Text>
        </AutoLayout>
      </AutoLayout>
    );
  }

  // Expanded view (when clicked)
  return (
    <AutoLayout
      x={pos.x}
      y={pos.y}
      direction="vertical"
      spacing={8}
      padding={16}
      fill="#FFFFFF"
      stroke="#E6E6E6"
      cornerRadius={8}
      width={300}
      effect={{
        type: "drop-shadow",
        color: { r: 0, g: 0, b: 0, a: 0.1 },
        offset: { x: 0, y: 2 },
        blur: 4,
        spread: 0,
      }}
    >
      <AutoLayout direction="vertical" spacing={4} width="fill-parent">
        <Text fontSize={16} fontWeight="bold">{trackingData.eventName}</Text>
        <AutoLayout
          fill={STATUS_COLORS[trackingData.status]}
          padding={{ horizontal: 8, vertical: 4 }}
          cornerRadius={4}
        >
          <Text fontSize={12} fill="#FFFFFF" fontWeight="bold">
            {trackingData.status.toUpperCase()}
          </Text>
        </AutoLayout>
      </AutoLayout>

      {trackingData.properties.length > 0 && (
        <AutoLayout direction="vertical" spacing={8} width="fill-parent">
          <Text fontSize={14} fontWeight="bold">Properties</Text>
          {trackingData.properties.map((prop, index) => (
            <AutoLayout key={index} direction="vertical" spacing={4} width="fill-parent">
              <AutoLayout direction="horizontal" spacing={8} width="fill-parent">
                <Text fontSize={12} fontWeight="bold" fill="#333333">{prop.name}</Text>
                <Text fontSize={12} fill="#666666">Type: {prop.type}</Text>
              </AutoLayout>
              {prop.description && (
                <Text fontSize={12} fill="#666666">{prop.description}</Text>
              )}
            </AutoLayout>
          ))}
        </AutoLayout>
      )}

      <AutoLayout 
        direction="horizontal" 
        spacing={8}
        width="fill-parent"
        verticalAlignItems="center"
      >
        <AutoLayout
          padding={8}
          cornerRadius={6}
          fill="#F0F0F0"
          onClick={() => setIsExpanded(false)}
        >
          <Text fontSize={12}>Collapse</Text>
        </AutoLayout>
        <AutoLayout
          padding={8}
          cornerRadius={6}
          fill="#F0F0F0"
          onClick={() => openUI(trackingData)}
        >
          <Text fontSize={12}>Edit</Text>
        </AutoLayout>
        <AutoLayout
          padding={8}
          cornerRadius={6}
          fill="#F0F0F0"
          onClick={() => {
            setTrackingData(null);
            setIsExpanded(false);
          }}
        >
          <Text fontSize={12}>Remove</Text>
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  );
}

widget.register(Widget);
