import React, { useEffect, useState, useCallback } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import Node from "./components/Node.jsx";
import DragNode from "./components/DragNode.jsx";
import Edge from "./components/Edge.jsx";

const nodeTypes = {
  node: Node,
  dragNode: DragNode,
};

const edgeTypes = {
  edge: Edge,
};

const NN = ({ nnData, lastInputData }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (nnData.length > 0) {
      const buildGraph = (nnData, lastInputData) => {
        let nodes = []; // 改：不要每次都完整生成nodes和edges，而是只更新需要更新的部分，参考color picker
        let edges = [];

        // test nodes
        nodes.push({
          id: "test",
          data: {
            onHeightChange: onHeightChange,
          },
          position: {
            x: 100,
            y: 100,
          },
          type: "dragNode",
        });

        // input layer nodes
        if (lastInputData) {
          lastInputData.forEach((input, inputIndex) => {
            const nodeId = `I${inputIndex}`;
            nodes.push({
              id: nodeId,
              data: {
                label: nodeId,
                Input: input.toFixed(2),
              },
              position: {
                x: 0,
                y: 100 + inputIndex * 150,
              },
              type: "node",
            });
          });
        }

        // hidden/output layer nodes
        nnData.forEach((layer, layerIndex) => {
          layer.forEach((neuron, neuronIndex) => {
            const nodeId = `L${layerIndex}N${neuronIndex}`;
            nodes.push({
              id: nodeId,
              data: {
                label: nodeId,
                Bias: neuron.bias.toFixed(2),
                Output: neuron.output.toFixed(2),
                Grad: neuron.grad.toFixed(2),
              },
              position: {
                x: (layerIndex + 1) * 350,
                y: 100 + neuronIndex * 150,
              },
              type: "node",
            });

            if (layerIndex == 0) {
              // input layer connection
              const inputLayer = lastInputData;
              inputLayer.forEach((input, inputIndex) => {
                const inputNodeId = `I${inputIndex}`;
                const currentNodeId = `L${layerIndex}N${neuronIndex}`;
                const edgeId = `${inputNodeId}-${currentNodeId}`;
                const val = neuron.weights[inputIndex].toFixed(2);
                edges.push({
                  id: edgeId,
                  source: inputNodeId,
                  target: currentNodeId,
                  type: "edge",
                  data: {
                    value: val,
                    isHovered: false,
                  },
                });
              });
            } else {
              // hidden/output layer connection
              const prevLayer = nnData[layerIndex - 1];
              prevLayer.forEach((prevNeuron, prevNeuronIndex) => {
                const prevNodeId = `L${layerIndex - 1}N${prevNeuronIndex}`;
                const currentNodeId = `L${layerIndex}N${neuronIndex}`;
                const edgeId = `${prevNodeId}-${currentNodeId}`;
                const val = neuron.weights[prevNeuronIndex].toFixed(2);
                edges.push({
                  id: edgeId,
                  source: prevNodeId,
                  target: currentNodeId,
                  type: "edge",
                  data: {
                    value: val,
                    isHovered: false,
                  },
                });
              });
            }
          });
        });

        setNodes(nodes);
        setEdges(edges);
      };

      buildGraph(nnData, lastInputData);
    }
  }, [nnData, lastInputData]);

  const onEdgeMouseEnter = (event, edge) => {
    const edgeId = edge.id;
    // console.log("Mouse entered the edge", edgeId);

    // Updates edge
    setEdges((prevElements) =>
      prevElements.map((element) =>
        element.id === edgeId
          ? {
              ...element,
              data: {
                ...element.data,
                isHovered: true,
              },
            }
          : element
      )
    );
  };

  const onEdgeMouseLeave = (event, edge) => {
    const edgeId = edge.id;
    // console.log("Mouse left the edge", edgeId);
    // Updates edge
    setEdges((prevElements) =>
      prevElements.map((element) =>
        element.id === edgeId
          ? {
              ...element,
              data: {
                ...element.data,
                isHovered: false,
              },
            }
          : element
      )
    );
  };

  const onHeightChange = (newHeight) => {
    console.log("newHeight:", newHeight);
  };

  return (
    <ReactFlowProvider>
      <div style={{ height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeMouseEnter={onEdgeMouseEnter}
          onEdgeMouseLeave={onEdgeMouseLeave}
          nodesDraggable={true}
          nodesConnectable={false}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default NN;
