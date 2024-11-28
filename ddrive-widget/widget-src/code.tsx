const { widget } = figma;
const { AutoLayout, Text, Rectangle, useSyncedState, SVG, Input } = widget;

function Widget() {
  const [trackingData, setTrackingData] = useSyncedState<{
    eventName: string;
    properties: Array<{
      name: string;
      type: string;
      description: string;
    }>;
    status: string;
  } | null>('trackingData', null);

  const [pos, setPos] = useSyncedState('pos', { x: 0, y: 0 });

  if (!trackingData) {
    return (
      <AutoLayout
        direction="vertical"
        spacing={8}
        padding={8}
        onClick={async () => {
          // Get the current viewport center
          const center = figma.viewport.center;
          setPos({ x: center.x, y: center.y });

          await new Promise((resolve) => {
            figma.showUI(__html__, { width: 500, height: 600 });
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
        }}
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
    >
      <AutoLayout direction="vertical" spacing={4} width="fill-parent">
        <Text fontSize={16} fontWeight="bold">{trackingData.eventName}</Text>
        <Text fontSize={12} fill="#666666">Status: {trackingData.status}</Text>
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
          hoverStyle={{ fill: "#E0E0E0" }}
          onClick={() => setTrackingData(null)}
        >
          <Text fontSize={12}>Remove</Text>
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  );
}

widget.register(Widget);
