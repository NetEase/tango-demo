import React, { useState, useEffect } from 'react';
import { Box } from 'coral-system';
import { Button, Space } from 'antd';
import {
  Designer,
  DesignerPanel,
  SettingPanel,
  Sidebar,
  Toolbar,
  WorkspacePanel,
  WorkspaceView,
  ComponentsPanel,
  CodeEditor,
  Sandbox,
  DndQuery,
} from '@music163/tango-designer';
import { createEngine, Workspace } from '@music163/tango-core';
import { IRouteComponentProps } from 'umi';
import { Logo, ProjectDetail } from './share';
import { sampleFiles } from '../mock/project';
import './index.less';
import demo from '../demo';
import { DemoItemType } from '../utils';

// 1. 实例化工作区
const workspace = new Workspace({
  entry: '/src/index.js',
  files: sampleFiles,
});

// 2. 引擎初始化
const engine = createEngine({
  workspace,
});

// @ts-ignore
window.__workspace__ = workspace;

const sandboxQuery = new DndQuery({
  context: 'iframe',
});

/**
 * 3. 平台初始化，访问 https://local.netease.com:6006/
 */
export default function App({ match, location }: IRouteComponentProps) {
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuData, setMenuData] = useState(false);

  const name = match?.params?.name || location?.query?.name;

  useEffect(() => {
    if (!name || !demo[name]) {
      return;
    }

    (demo[name] as DemoItemType)?.files?.forEach?.((item) => {
      workspace.updateFile(item.filename, item.code);
    });
  }, [name]);

  return (
    <Designer engine={engine} sandboxQuery={sandboxQuery}>
      <DesignerPanel
        logo={<Logo />}
        description={<ProjectDetail name={demo[name] && (demo[name]?.title || name)} />}
        actions={
          <Box px="l">
            <Toolbar>
              <Toolbar.Item key="routeSwitch" placement="left" />
              <Toolbar.Item key="modeSwitch" placement="right" />
              <Toolbar.Item key="togglePanel" placement="right" />
              <Toolbar.Separator />
              <Toolbar.Item key="extra" placement="right">
                <Space>
                  <Button type="primary">发布</Button>
                </Space>
              </Toolbar.Item>
            </Toolbar>
          </Box>
        }
      >
        <Sidebar>
          <Sidebar.Item key="outline" />
          <Sidebar.Item key="components">
            <ComponentsPanel menuData={menuData as any} loading={menuLoading} />
          </Sidebar.Item>
          <Sidebar.Item key="variables" isFloat width={800} />
          <Sidebar.Item key="dataSource" isFloat width={800} />
          <Sidebar.Item key="dependency" isFloat width={800} />
        </Sidebar>
        <WorkspacePanel>
          <WorkspaceView mode="design">
            <Sandbox
              bundlerURL={process.env.SANDBOX_BUNDLER_URL || 'https://tango-demo.musicfe.com'}
              onMessage={(e) => {
                if (e.type === 'done') {
                  const sandboxWindow: any = sandboxQuery.window;
                  if (sandboxWindow.TangoAntd) {
                    if (sandboxWindow.TangoAntd.menuData) {
                      setMenuData(sandboxWindow.TangoAntd.menuData);
                    }
                    if (sandboxWindow.TangoAntd.prototypes) {
                      workspace.setComponentPrototypes(sandboxWindow.TangoAntd.prototypes);
                    }
                  }
                  setMenuLoading(false);
                }
              }}
            />
          </WorkspaceView>
          <WorkspaceView mode="code">
            <CodeEditor />
          </WorkspaceView>
        </WorkspacePanel>
        <SettingPanel />
      </DesignerPanel>
    </Designer>
  );
}
