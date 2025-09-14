import { FunctionalSystem } from "@/ecs/FunctionalSystem";
import { EntityElement, ComponentType } from "@/types";
import { CameraComponent, TransformComponent } from "@/types/components";
import { Camera2D } from "@/graphics/Camera2D";

export class CameraSystem extends FunctionalSystem {
    requiredComponents: ComponentType[] = ['camera', 'transform'];
    private activeCameras: EntityElement[] = [];
    private mainCamera: EntityElement | null = null;
    private compatibilityCamera: Camera2D | null = null;

    update(entities: EntityElement[], deltaTime: number): void {
        // Get camera entities using FunctionalSystem's filtering
        const cameraEntities = this.getEntitiesWithComponents(entities, this.requiredComponents);

        // Filter active cameras
        this.activeCameras = cameraEntities.filter(entity => {
            const camera = entity.getComponent<CameraComponent>('camera');
            return camera && camera.isActive;
        });

        if (this.activeCameras.length === 0) {
            this.mainCamera = null;
            return;
        }

        // Sort by priority (highest first)
        this.activeCameras.sort((a, b) => {
            const cameraA = a.getComponent<CameraComponent>('camera');
            const cameraB = b.getComponent<CameraComponent>('camera');
            const priorityA = cameraA?.priority || 0;
            const priorityB = cameraB?.priority || 0;
            return priorityB - priorityA;
        });

        // Set main camera (highest priority)
        this.mainCamera = this.activeCameras[0];

        // Update all active cameras
        this.activeCameras.forEach(entity => {
            this.updateCameraEntity(entity, deltaTime);
        });

        // Create or update compatibility camera for RenderSystem
        this.updateCompatibilityCamera();
    }

    private updateCameraEntity(entity: EntityElement, _deltaTime: number): void {
        const camera = entity.getComponent<CameraComponent>('camera');
        const transform = entity.getComponent<TransformComponent>('transform');

        if (!camera || !transform) return;

        // Update camera viewport if needed
        // Camera position is handled by transform component
        // Additional camera-specific logic would go here
        // deltaTime can be used for time-based camera animations
    }

    /**
     * Create a Camera2D instance that's compatible with RenderSystem
     * This bridges the gap between ECS cameras and the existing rendering pipeline
     */
    private updateCompatibilityCamera(): void {
        if (!this.mainCamera) {
            this.compatibilityCamera = null;
            return;
        }

        const camera = this.mainCamera.getComponent<CameraComponent>('camera');
        const transform = this.mainCamera.getComponent<TransformComponent>('transform');

        if (!camera || !transform) {
            this.compatibilityCamera = null;
            return;
        }

        // Create or update compatibility camera
        if (!this.compatibilityCamera) {
            this.compatibilityCamera = new Camera2D(camera.viewport.width, camera.viewport.height);
        }

        // Sync properties
        this.compatibilityCamera.position.x = transform.position.x;
        this.compatibilityCamera.position.y = transform.position.y;
        this.compatibilityCamera.zoom = camera.zoom;
        this.compatibilityCamera.rotation = transform.rotation;
        this.compatibilityCamera.setViewport(camera.viewport.width, camera.viewport.height);
    }

    // Public API methods
    public getMainCamera(): EntityElement | null {
        return this.mainCamera;
    }

    public getCompatibilityCamera(): Camera2D | null {
        return this.compatibilityCamera;
    }

    public getActiveCameras(): EntityElement[] {
        return [...this.activeCameras];
    }

    public getCameraByPriority(priority: number): EntityElement | null {
        return this.activeCameras.find(entity => {
            const camera = entity.getComponent<CameraComponent>('camera');
            return camera?.priority === priority;
        }) || null;
    }

    public setMainCamera(entity: EntityElement): void {
        const camera = entity.getComponent<CameraComponent>('camera');
        if (camera) {
            // Set highest priority
            const maxPriority = Math.max(
                0, // Ensure minimum priority of 1
                ...this.activeCameras.map(cam => {
                    const c = cam.getComponent<CameraComponent>('camera');
                    return c?.priority || 0;
                })
            );
            camera.priority = maxPriority + 1;
            camera.isActive = true;

            // Update main camera immediately
            this.mainCamera = entity;

            // Add to active cameras if not already there
            if (!this.activeCameras.includes(entity)) {
                this.activeCameras.push(entity);
            }
        }
    }
}